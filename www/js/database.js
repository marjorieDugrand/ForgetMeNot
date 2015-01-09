/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

fmnApp.service("databaseService", function ($q) {
    this.$q = $q;

    var fmnDB;
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;

    this.initDB = function () {
        var dbPromise = $q.defer();
        createDB().then(function () {
            if (!doesDBContainsUser('Rajon')) {
                console.log('adding rajon');
                addUser(new User('Rajon', 'rajon.rondo@dallas.com', true, 3));
            }
            dbPromise.resolve();
        });
        return dbPromise.promise;
    };

    var createDB = function () {
        var dbPromise = $q.defer();
        var request = indexedDB.open("ForgetMeNotDB", 1);
        request.onerror = function (evt) {
            console.log("Database error code: " + evt.target.errorCode);
        };

        request.onsuccess = function (evt) {
            fmnDB = request.result;
            dbPromise.resolve(fmnDB);
        };

        request.onupgradeneeded = function (evt) {
            fmnDB = evt.currentTarget.result;
            var usersOS = fmnDB.createObjectStore("users",
                    {keyPath: "user_id", autoIncrement: true});
            usersOS.createIndex("username", "username", {unique: true});
            usersOS.createIndex("email", "email", {unique: true});
            usersOS.createIndex("geolocation", "geolocation", {unique: false});
            usersOS.createIndex("language_id", "language_id", {unique: false});
            usersOS.createIndex("lastModification", "lastModification", {unique: false});

            var tasksOS = fmnDB.createObjectStore("tasks",
                    {keyPath: "task_id", autoIncrement: true});
            tasksOS.createIndex("name", "name", {unique: false});
            tasksOS.createIndex("owner_id", "owner_id", {unique: false});
            tasksOS.createIndex("description", "description", {unique: false});
            tasksOS.createIndex("context_id", "context_id", {unique: false});
            tasksOS.createIndex("duration", "duration", {unique: false});
            tasksOS.createIndex("priority", "priority", {unique: false});
            tasksOS.createIndex("label", "label", {unique: false});
            tasksOS.createIndex("progression", "progression", {unique: false});
            tasksOS.createIndex("dueDate", "dueDate", {unique: false});
            tasksOS.createIndex("lastModification", "lastModification", {unique: false});

            var contextsOS = fmnDB.createObjectStore("contexts",
                    {keyPath: "context_id", autoIncrement: true});
            contextsOS.createIndex("name", "name", {unique: false});
            contextsOS.createIndex("owner_id", "owner_id", {unique: false});
            contextsOS.createIndex("addressUsed", "addressUsed", {unique: false});
            contextsOS.createIndex("location", "location", {unique: false});
            contextsOS.createIndex("lastModification", "lastModification", {unique: false});

            var dateListsOS = fmnDB.createObjectStore("dateLists",
                    {keyPath: "list_id", autoIncrement: true});
            dateListsOS.createIndex("name", "name", {unique: false});
            dateListsOS.createIndex("owner_id", "owner_id", {unique: false});

            var languagesData = [
                {name: "French", lastModification: Date.now()},
                {name: "Spanish", lastModification: Date.now()},
                {name: "English", lastModification: Date.now()}
            ];

            var languagesOS = fmnDB.createObjectStore("languages",
                    {keyPath: "language_id", autoIncrement: true});
            languagesOS.createIndex("name", "name", {unique: true});
            languagesOS.createIndex("lastModification", "lastModification", {unique: false});
            var i;
            for (i in languagesData) {
                languagesOS.add(languagesData[i]);
            }
            dbPromise.resolve(fmnDB);

        };
        return dbPromise.promise;
    };

    var doesDBContainsUser = function (username) {
        var exists = false;
        getContent(['users'], 'users', 'username', username)
                .then(function (userResult) {
                    if (userResult.result) {
                        exists = true;
                    }
                });
        return exists;
    };

    var addUser = function (user) {
        storeContent(["users"], "users", {username: user.username,
            email: user.email,
            geolocation: user.geolocation,
            language_id: user.language_id})
                .then(function () {
                    console.log("user " + username + " successfully added");
                });
    };

    this.getUser = function (username) {
        var user;
        var userPromise = $q.defer();
        getContent(['users'], 'users', 'username', username)
                .then(function (userResult) {
                    user = new User(userResult.result.username,
                            userResult.result.email,
                            userResult.result.geolocation,
                            userResult.result.language_id,
                            userResult.result.user_id,
                            userResult.result.lastModification);
                    console.log('user recovered');
                    userPromise.resolve(user);
                });
        return userPromise.promise;
    };

    var getContent = function (transactionO, store, indexName, value) {
        var contentPromise = $q.defer();
        var transaction = fmnDB.transaction(transactionO, 'readonly');
        var store = transaction.objectStore(store);
        var index = store.index(indexName);
        console.log("jusque là ça va");
        index.get(value).onsuccess = function (evt) {
            contentPromise.resolve(evt.target);
        };
        return contentPromise.promise;
    };

    this.getLanguages = function () {
        var languages = [];
        getRecords(['languages'], 'languages').then(function (result) {
            for (var l = 0; l < result.length; l++) {
                languages.push(new Language(result[l].name, result[l].language_id,
                        result[l].lastModification));
            }
        });
        return languages;
    };

    this.getUserContexts = function (user_id) {
        var contexts = [];
        getRecordsWithOwnerCondition(['contexts'], 'contexts', user_id).then(function (result) {
            for (var c = 0; c < result.length; c++) {
                contexts.push(new Context(result[c].name, result[c].owner_id,
                        result[c].location, result[c].addressUsed,
                        result[c].context_id, result[c].lastModification));
            }
        });
        return contexts;
    };

    this.getTasksByCondition = function (type, condition, userId) {
        var recordsPromise = $q.defer();
        var records = [];
        var objectStore = fmnDB.transaction(['tasks'], 'readonly').objectStore('tasks');
        var request = objectStore.openCursor();

        request.onsuccess = function (evt) {
            var cursor = evt.target.result;

            if (cursor) {
                var record = cursor.value;
                if (record.owner_id === userId) {
                    switch (type) {
                        case "context":
                            if (record.context_id === condition) {
                                records.push(record);
                            }
                            break;
                        case "priority":
                            if (record.priority === condition) {
                                records.push(record);
                            }
                            break;
                        case "keyword":
                            if (condition !== "") {
                                // On cherche dans le champ label et dans le champ nom
                                if ((record.label.toLowerCase().indexOf(condition.toLowerCase()) !== -1) || (record.name.toLowerCase().indexOf(condition.toLowerCase()) !== -1)) {
                                    records.push(record);
                                }
                            }
                            break;
                        case "forDate":
                            if (condition !== "") {
                                //var dueDate = new Date(record.dueDate);
                                var dueDate = record.dueDate;
                                if (dueDate !== "" && dueDate <= condition) {
                                    records.push(record);
                                }
                            } else {
                                if (record.dueDate === "") {
                                    records.push(record);
                                }
                            }
                            break;
                        case "preciseDate":
                            var dueDate = record.dueDate;
                            if (dueDate !== "" && dueDate === condition) {
                                records.push(record);
                            }
                            break;
                        case "beforeDate":
                            var dueDate = record.dueDate;
                            if (dueDate !== "" && dueDate < condition) {
                                records.push(record);
                            }
                            break;
                        default:
                            console.log("Bad type argument!");
                    }
                }
                cursor.continue();
            }
            else {
                console.log("Cannot recover more records");
                recordsPromise.resolve(records);
            }
            ;
        };
        return recordsPromise.promise;
    };

    var getRecordsWithOwnerCondition = function (transactionO, store, ownerCondition) {
        var recordsPromise = $q.defer();
        var records = [];
        var objectStore = fmnDB.transaction(transactionO, 'readonly').objectStore(store);
        var request = objectStore.openCursor();
        request.onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
                var record = cursor.value;
                if (record.owner_id === ownerCondition) {
                    records.push(record);
                }
                cursor.continue();
            } else {
                console.log("Cannot recover more records");
                recordsPromise.resolve(records);
            }
            ;
        };
        return recordsPromise.promise;
    };

    var getRecords = function (transactionO, store) {
        var recordsPromise = $q.defer();
        var records = [];
        var objectStore = fmnDB.transaction(transactionO, 'readonly').objectStore(store);
        var request = objectStore.openCursor();
        request.onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
                var record = cursor.value;
                records.push(record);
                cursor.continue();
            } else {
                console.log("Cannot recover more records");
                recordsPromise.resolve(records);
            }
            ;
        };
        return recordsPromise.promise;
    };


    var storeContent = function (transactionO, store, object) {
        var storePromise = $q.defer();
        var transaction = fmnDB.transaction(transactionO, 'readwrite');
        transaction.oncomplete = function () {
            console.log("Success transaction");
        };
        var objectStore = transaction.objectStore(store);
        var request = objectStore.add(object);
        request.onsuccess = function (evt) {
            storePromise.resolve(evt.target.result);
        };
        return storePromise.promise;
    };

    this.storeTask = function (task) {
        var keyPromise = $q.defer();
        storeContent(['tasks'], "tasks", {name: task.name,
            owner_id: task.owner_id,
            description: task.description,
            context_id: task.context_id,
            duration: task.duration,
            priority: task.priority,
            label: task.label,
            progression: task.progression,
            dueDate: task.dueDate,
            lastModification: task.lastModification})
                .then(function (result) {
                    console.log("task " + task.name + " successfully added");
                    keyPromise.resolve(result);
                });
        return keyPromise.promise;
    };

    this.updateTask = function (task) {
        var objectStore = fmnDB.transaction(['tasks'], 'readwrite').objectStore('tasks');
        var request = objectStore.put(task);
        request.onsuccess = function () {
            console.log("The task has been updated.");
        };
    };

    this.storeContext = function (context) {
        var keyPromise = $q.defer();
        storeContent(['contexts'], 'contexts', {name: context.name,
            owner_id: context.owner_id,
            location: context.location,
            addressUsed: context.addressUsed,
            lastModification: context.lastModification})
                .then(function (result) {
                    console.log("context " + context.name + " successfully added");
                    keyPromise.resolve(result);
                });
        return keyPromise.promise;
    };

    this.getTask = function (taskId, userId) {
        var taskPromise = $q.defer();
        getContentByKey(['tasks'], "tasks", taskId).then(function (result) {
            if (result.owner_id === userId) {
                taskPromise.resolve(new Task(result.name, result.owner_id, result.description,
                        result.context_id, result.duration, result.priority,
                        result.label, result.progression, result.dueDate,
                        result.lastModification, result.task_id));
            } else {
                console.log("user is not owner of the task");
                taskPromise.resolve(null);
            }
        });

        return taskPromise.promise;
    };

    this.getUserByID = function (userId) {
        var userPromise = $q.defer();
        getContentByKey(['users'], "users", userId).then(function (result) {
            userPromise.resolve(new User(result.username, result.email, result.geolocation,
                    result.language_id, result.user_id, result.lastModification));
        });
        return userPromise.promise;
    };

    this.getContext = function (contextId, userId) {
        var contextPromise = $q.defer();
        getContentByKey(['contexts'], "contexts", contextId).then(function (result) {
            if (result.owner_id === userId) {
                contextPromise.resolve(new Context(result.name, result.owner_id,
                        result.location, result.addressUsed,
                        result.context_id, result.lastModification));
            } else {
                console.log("user is not the context's owner");
                contextPromise.resolve(null);
            }
        });

        return contextPromise.promise;
    };

    this.removeTaskFromDB = function (taskId) {
        var objectStore = fmnDB.transaction(['tasks'], 'readwrite').objectStore('tasks');
        // Supprime la tâche de la BDD
        var request = objectStore.delete(taskId);
        request.onsuccess = function () {
            console.log("The task has been removed");
        };
    };

    this.removeContextFromDB = function (contextId) {
        // On modifie le contexte des tâches associées au contexte à supprimer
        this.getTasksByCondition("context", contextId).then(function (result) {
            for (var i = 0; i < result.length; i++) {
                console.log(result[i].name);
                result[i].context_id = '';
                var objectStoreForTask = fmnDB.transaction(['tasks'], 'readwrite').objectStore('tasks');
                var taskRequest = objectStoreForTask.put(result[i]);
                taskRequest.onsuccess = function () {
                    console.log("The task has been updated.");
                };
            }

            // Supprime le contexte de la BDD
            var objectStoreForContext = fmnDB.transaction(['contexts'], 'readwrite').objectStore('contexts');
            var contextRequest = objectStoreForContext.delete(contextId);
            contextRequest.onsuccess = function () {
                console.log("The context has been removed");
            };
        });
    };


    this.updateUserSettings = function (user) {
        var updatePromise = $q.defer();
        this.getUserByID(user.user_id).then(function (result) {
            var request = fmnDB.transaction(['users'], 'readwrite').objectStore('users').put(user);
            request.onsuccess = function () {
                console.log("The user has been updated.");
                updatePromise.resolve();
            };
        });
        return updatePromise.promise;
    };

    var getContentByKey = function (transactionO, store, key) {
        var objectPromise = $q.defer();
        var transaction = fmnDB.transaction(transactionO);
        var objectStore = transaction.objectStore(store);
        objectStore.get(key).onsuccess = function (event) {
            var object = event.target.result;
            objectPromise.resolve(object);
        };
        return objectPromise.promise;
    };


    this.rmDB = function () {
        var rmPromise = $q.defer();
        indexedDB.deleteDatabase("ForgetMeNotDB").onsuccess = function (evt) {
            rmPromise.resolve();
            console.log("deleted");
        };
        return rmPromise.promise;

    };
});

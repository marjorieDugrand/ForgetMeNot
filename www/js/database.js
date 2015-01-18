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
            usersOS.createIndex("username", "username", {unique: false});
            usersOS.createIndex("email", "email", {unique: true});
            usersOS.createIndex("geolocation", "geolocation", {unique: false});
            usersOS.createIndex("language_id", "language_id", {unique: false});
            usersOS.createIndex("lastModification", "lastModification", {unique: false});
            usersOS.createIndex("serveur_id", "serveur_id", {unique: true});

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
            tasksOS.createIndex("serveur_id", "serveur_id", {unique: true});

            var contextsOS = fmnDB.createObjectStore("contexts",
                    {keyPath: "context_id", autoIncrement: true});
            contextsOS.createIndex("name", "name", {unique: false});
            contextsOS.createIndex("owner_id", "owner_id", {unique: false});
            contextsOS.createIndex("addressUsed", "addressUsed", {unique: false});
            contextsOS.createIndex("location", "location", {unique: false});
            contextsOS.createIndex("lastModification", "lastModification", {unique: false});
            contextsOS.createIndex("serveur_id", "serveur_id", {unique: true});

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

    var doesDBContainsUser = function (email) {
        var checkPromise = $q.defer();
        getContent(['users'], 'users', 'email', email)
                .then(function (userResult) {
                    if (userResult.result) {
                        checkPromise.resolve(true);
                    } else {
                        checkPromise.resolve(false);
                    }
                });
        return checkPromise.promise;
    };

    var addUser = function (user) {
        var userPromise = $q.defer();
        console.log("adding user");
        storeContent(["users"], "users", {username: user.username,
                                          email: user.email,
                                          geolocation: user.geolocation,
                                          language_id: user.language_id,
                                          lastModification : user.lastModification,
                                          serveur_id : user.serveur_id})
                .then(function (result) {
                    console.log("user " + username + " successfully added");
                    user.serveur_id = result;
                    userPromise.resolve(user);
                });
        return userPromise.promise;
    };

    var getContent = function (transactionO, store, indexName, value) {
        var contentPromise = $q.defer();
        var transaction = fmnDB.transaction(transactionO, 'readonly');
        var store = transaction.objectStore(store);
        var index = store.index(indexName);
        index.get(value).onsuccess = function (evt) {
            contentPromise.resolve(evt.target);
        };
        return contentPromise.promise;
    };

    this.getLanguages = function () {
        var languagesPromise = $q.defer();  
        var languages = [];
        getRecords(['languages'], 'languages').then(function (result) {
            for (var l = 0; l < result.length; l++) {
                languages.push(new Language(result[l].name, result[l].language_id,
                                            result[l].lastModification));
            }
            languagesPromise.resolve(languages);
        });
        return languagesPromise.promise;
    };

    this.getUserContexts = function (user_id) {
        var contexts = [];
        getRecordsWithOwnerCondition(['contexts'], 'contexts', user_id).then(function (result) {
            for (var c = 0; c < result.length; c++) {
                contexts.push(new Context(result[c].name, result[c].owner_id,
                                          result[c].location, result[c].addressUsed,
                                          result[c].context_id,result[c].lastModification,
                                          result[c].serveur_id));
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
                if(record.owner_id === userId) {
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
            };
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
            var key = evt.target.result;
            switch(store) {
                case 'users':
                   object.user_id = key;
                   break;
                case 'tasks':
                   object.task_id = key;
                   break;
                default:
                   object.context_id = key;
            } 
            object.serveur_id = key;
            updateContent(transactionO,store,object).then(function() {
               storePromise.resolve(key); 
            });
        };
        return storePromise.promise;
    };

    var updateContent = function(transactionO, store, content) {
        var updatePromise = $q.defer();
        var objectStore = fmnDB.transaction(transactionO, 'readwrite').objectStore(store);
        var request = objectStore.put(content);
        request.onsuccess = function () {
            updatePromise.resolve();
            console.log("Your content has been updated.");
        };
        return updatePromise.promise;
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
            lastModification: task.lastModification,
            serveur_id : task.serveur_id})
                .then(function (result) {
                    console.log("task " + task.name + " successfully added");
                    keyPromise.resolve(result);
                });
        return keyPromise.promise;
    };
    
    this.storeContext = function(context) {
        var keyPromise = $q.defer();
        storeContent(['contexts'], 'contexts', {name : context.name,
                                                owner_id : context.owner_id,
                                                location : context.location,
                                                addressUsed : context.addressUsed,
                                                lastModification : context.lastModification,
                                                serveur_id : context.serveur_id})
                .then(function(result) {
                    console.log("context " + context.name + " successfully added");
                    keyPromise.resolve(result);
                }); 
        return keyPromise.promise;
    };  
    
    this.getTask = function(taskId, userId) {
        var taskPromise = $q.defer();
        getContentByKey(['tasks'], "tasks", taskId).then(function(result) {
            if(result.owner_id === userId) {
                taskPromise.resolve(new Task(result.name, result.owner_id, result.description,
                                             result.context_id, result.duration, result.priority,
                                             result.label, result.progression, result.dueDate,
                                             result.lastModification, result.task_id, result.serveur_id));
            } else {
                console.log("user is not owner of the task");
                taskPromise.resolve(null);
            }
        });
   
        return taskPromise.promise;
    };
    
    this.getUserByID = function(userId) {
        var userPromise = $q.defer();
        getContentByKey(['users'], "users", userId).then(function(result) {
            userPromise.resolve(new User(result.username, result.email, result.geolocation,
                                         result.language_id, result.user_id,
                                         result.lastModification, result.serveur_id));
        });
        return userPromise.promise;      
    };
    
    var getUser = function (username) {
        var user;
        var userPromise = $q.defer();
        getContent(['users'], 'users', 'username', username)
                .then(function (userResult) {
                    user = new User(userResult.result.username,
                            userResult.result.email,
                            userResult.result.geolocation,
                            userResult.result.language_id,
                            userResult.result.user_id,
                            userResult.result.lastModification,
                            userResult.result.serveur_id);
                            
                    console.log('user recovered');
                    userPromise.resolve(user);
                });
        return userPromise.promise;
    };
    
    this.getContext = function(contextId, userId) {
      var contextPromise=$q.defer();
        getContentByKey(['contexts'], "contexts", contextId).then(function(result) {
            if(result.owner_id === userId) {
                contextPromise.resolve(new Context(result.name, result.owner_id, result.location,
                                                   result.addressUsed, result.context_id,
                                                   result.lastModification, result.serveur_id));
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
    
    
    this.updateUserSettings = function(user) {
        var updatePromise = $q.defer();
        this.getUserByID(user.user_id).then(function(result) {
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
        objectStore.get(key).onsuccess = function(event) {
            var object = event.target.result;
            objectPromise.resolve(object);
        };
        return objectPromise.promise;
    };

    this.getLanguageByID = function(id) {
        var languagePromise = $q.defer();
        getContentByKey("languages","languages",id).then(function(result) {
            languagePromise.resolve(result);
        });
        return languagePromise.promise;
    };

    this.rmDB = function () {
        var rmPromise = $q.defer();
        indexedDB.deleteDatabase("ForgetMeNotDB").onsuccess = function (evt) {
            rmPromise.resolve();
            console.log("deleted");
        };
        return rmPromise.promise;

    };
    
    this.addIfNotAlreadyInDatabase = function(user) {
        var userPromise = $q.defer();
        console.log('checking...');
        doesDBContainsUser(user.email).then(function(exists) {
            if(!exists) {
                console.log("user does not exist... adding him");
                addUser(user).then(function(result) {
                    userPromise.resolve(result);
                });
            } else {
                console.log("user already in database");
                getUser(user.username).then(function(result) {
                    userPromise.resolve(result); 
                });
            }
        });
        return userPromise.promise;
    };
});

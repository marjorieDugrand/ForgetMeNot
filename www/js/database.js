/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



fmnApp.service("databaseService", function($q) {
    this.$q = $q;
    
    var fmnDB;
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    
    this.initDB = function() {
        var dbPromise = $q.defer();
        var request = indexedDB.open("ForgetMeNotDB", 1);
        request.onerror = function(evt) {
            console.log("Database error code: " + evt.target.errorCode);  
        };
    
        request.onsuccess = function(evt) {
            fmnDB = request.result;
            dbPromise.resolve(fmnDB);
        };

        request.onupgradeneeded = function (evt) {
            fmnDB = evt.currentTarget.result;
            var usersOS = fmnDB.createObjectStore("users", 
                            { keyPath: "user_id", autoIncrement: true });
            usersOS.createIndex("username", "username", { unique: true });
            usersOS.createIndex("email", "email", { unique: true });
            usersOS.createIndex("language", "language", { unique: false });
            usersOS.createIndex("geolocalisation", "geolocalisation", { unique: false });

            var tasksOS = fmnDB.createObjectStore("tasks", 
                            { keyPath: "task_id", autoIncrement: true });
            tasksOS.createIndex("name", "name", { unique: false });
            tasksOS.createIndex("owner", "owner", {unique: false });
            tasksOS.createIndex("description", "description", { unique: false });
            tasksOS.createIndex("context", "context", { unique: false });
            tasksOS.createIndex("duration", "duration", {unique: false });
            tasksOS.createIndex("priority", "priority", {unique: false });
            tasksOS.createIndex("label", "label", { unique: false });
            tasksOS.createIndex("progression", "progression", {unique: false });
            tasksOS.createIndex("dueDate", "dueDate", { unique: false });
            tasksOS.createIndex("lastModification", "lastModification", { unique: false });	
		
            var contextsOS = fmnDB.createObjectStore("contexts", 
                                { keyPath: "context_id", autoIncrement: true });
                contextsOS.createIndex("name", "name", { unique: false });
                contextsOS.createIndex("owner", "owner", { unique: false });
                contextsOS.createIndex("location", "location", { unique: false });

            var dateListsOS = fmnDB.createObjectStore("dateLists", 
                                { keyPath: "list_id", autoIncrement: true });
                dateListsOS.createIndex("name", "name", { unique: false });
                dateListsOS.createIndex("owner", "owner", { unique: false });
		
            var languagesData = [
                { name: "French" },
                { name: "Spanish" },
                { name: "English" }
            ];

            var languagesOS = fmnDB.createObjectStore("languages", 
                                { keyPath: "language_id", autoIncrement: true }); 
            languagesOS.createIndex("name", "name", { unique: true });
            var i;	
            for (i in languagesData) {
                languagesOS.add(languagesData[i]);
            }
            addUser('Rajon', 'rajon.rondo@gmail.com', 'English', 'true');
            dbPromise.resolve(fmnDB);
        
        };
        return dbPromise.promise;
    };
    
    this.addUser = function(username, email, language, geolocalisation) {   
        var transaction = fmnDB.transaction(['users'], 'readwrite');
        var objectStore = transaction.objectStore("users");                    
        var request = objectStore.add({ username: username,
                                        email: email,
                                        language: language,
                                        geolocalisation: geolocalisation });
        request.onsuccess = function (evt) {
            console.log("user " + username + " successfully added");
        };
    };

    var user;
    
    this.getUser = function(username) {
        var userPromise = this.$q.defer();
        var transaction = fmnDB.transaction(['users'],'readonly');
        var store = transaction.objectStore('users');
        var index = store.index('username');
        index.get(username).onsuccess = function(evt) {
            var userResult = evt.target.result;
            user = new User(userResult.username,
                                userResult.email,
                                userResult.geolocalisation,
                                userResult.language);         
            
            userPromise.resolve(user);
            console.log('user recovered');
        };
        return userPromise.promise;
    };
    
    this.getLanguages = function() {
        return ['French', 'English', 'Spanish'];
    };
    
    var storeContent = function(transactionO, store, object) {
        var storePromise = $q.defer();
        var transaction = fmnDB.transaction(transactionO, 'readwrite');
        var objectStore = transaction.objectStore(store);                    
        var request = objectStore.add(object);
        request.onsuccess = function (evt) {
            storePromise.resolve(evt.target.result);
        };
        return storePromise.promise;
    };
    
    this.storeTask = function(task) {
        var key;
        storeContent(['tasks'], "tasks", task).then(function(result) {
            console.log("task " + task.name + " successfully added");
            key = result;
        });
        return key;
    };
    
    this.storeContext = function(context) {
        var key;
        storeContent(['contexts'], 'contexts', context).then(function(result) {
            console.log("context " + context.name + " successfully added");
            key = result;
        }); 
        return key;
    };
    
});
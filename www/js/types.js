/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var User = function(username, email, geolocation, language_id, user_id, lastModification) {
    this.user_id = user_id;
    this.username = username;
    this.email = email;
    this.geolocation = geolocation;
    this.language_id = language_id;
    this.lastModification = lastModification || Date.now();
};

var Task = function (name, owner_id, description, context_id, duration,
                     priority, label, progression, dueDate, lastModification, task_id) {
    this.task_id = task_id || null;
    this.name = name || '';
    this.owner_id = owner_id || '';
    this.description = description || '';
    this.context_id = context_id || '';
    this.duration = duration || 0;
    this.priority = priority || "0";
    this.label = label || '';
    this.progression = progression || 0;
    this.dueDate = dueDate || '';
    this.lastModification = lastModification || Date.now();  
};

var Context = function(name, owner_id, location, addressUsed, context_id, lastModification) {
    this.context_id = context_id || null;
    this.name = name || '';
    this.owner_id = owner_id || '';
    this.location = location || '';
    this.addressUsed = addressUsed || '';
    this.lastModification = lastModification || Date.now();
};

var Language = function(name, language_id, lastModification) {
    this.language_id = language_id || null;
    this.name = name || '';
    this.lastModification = lastModification || Date.now();
};
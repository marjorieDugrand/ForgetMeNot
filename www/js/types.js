/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var User = function(user_id, username, email, geolocalization, language) {
    this.user_id = user_id || null;
    this.username = username;
    this.email = email;
    this.geolocalization = geolocalization;
    this.language = language;
};

var Task = function (task_id, name, owner, description, context, duration,
                     priority, label, progression, dueDate, lastModification) {
    this.task_id = task_id || null;
    this.name = name || '';
    this.owner = owner || '';
    this.description = description || '';
    this.context = context || '';
    this.duration = duration || 0;
    this.priority = priority || 0;
    this.label = label || '';
    this.progression = progression || 0;
    this.dueDate = dueDate || '';
    this.lastModification = lastModification || '';  
};

var Context = function(context_id, name, owner, location) {
    this.context_id = context_id || null;
    this.name = name || '';
    this.owner = owner || '';
    this.location = location || '';
};

var Language = function(language_id, name) {
    this.language_id = language_id || null;
    this.name = name || '';
};
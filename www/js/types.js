/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var User = function(username, email, geolocalization, language) {
    this.username = username;
    this.email = email;
    this.geolocalization = geolocalization;
    this.language = language;
};

var Task = function (name,owner, description,context,duration,priority,label,progression, lastModification, dueDate) {
    this.name = name || '';
    this.owner = owner || '';
    this.description = description || '';
    this.context = context || '';
    this.duration = duration || 0;
    this.priority = priority || 0;
    this.label = label || '';
    this.progression = progression || 0;
    this.lastModification = lastModification || '';
    this.dueDate = dueDate || '';
};



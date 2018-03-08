# Quick Example
```JavaScript
var OL = require('object-layers');

// Site Settings
var config = new OL({
    admin: false,
    login: false,
    seometa: true,
});
// config = 
{
 admin: false,
 login: false,
 seometa: true
}


// Subdomain Settings
config[OL].push();
config.login = true;
// config = 
// {
//  admin: false,
//  login: true,
//  seometa: true,
// }


// Page Settings
config[OL].push({admin: true});
delete config.seometa
// config = 
// {
//  admin: true,
//  login: true,
// }

config[OL].delete('seometa', true);
// config = 
// {
//  admin: true,
//  login: true,
//  seometa: true,
// }

config[OL].pop();
// config = 
// {
//  admin: false,
//  login: true,
//  seometa: true,
// }


```
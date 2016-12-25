## What is Mustgen?
Mustgen is a very simple file generator based on [mustache.js](https://github.com/janl/mustache.js).
It takes {{mustached}} template and javascript object as a map with values and file definitions, then generates string with mustache.js, and then writes it to a file.

## Why it exists?
It was created as an alternative code generator for [Entitas](https://github.com/sschmid/Entitas-CSharp).

## How to use?

### 1. Install
```bash
$ npm install mustgen --save
```

### 2. Add template `hello.mustgen` at root of your project

```
Hello {{name}}.

Random words: {{#words}}{{.}} {{/words}}

{{#person}}
And this is block of {{name}} {{lastname}}.
{{/person}}
```

### 3. Add `map.js` at root of your project
```javascript
var helloFile = {
    template: 'project/templates/hello.mustgen',
    output: 'generated/hello.txt',
    data: {
        name: "totally useful tool",
        words: ["Lonely", "Sad", "Depressed"],
        person: {
            name: "Stephen",
            lastname: "King"
        }
    }
}

module.exports = [helloFile];
```



### 4. Add `server.js` at root of your project
```javascript
var map = require('./map');
var mustgen = require('mustgen');

mustgen('./', map);
```


### 5. Run server
```bash
$ cd pathToYourProject
$ node server
```

### 6. Enjoy
```
Hello totally useful tool.

Random words: Lonely Sad Depressed

And this is block of Stephen King.
```

### Code generation example
Check out [EntitasMustgen](https://github.com/vladpazych/EntitasMustgen), it's a boilerplate for Entitas users. Mustgen used to generate Entitas API.


## Maintainer
* [@vladpazych](https://github.com/vladpazych)


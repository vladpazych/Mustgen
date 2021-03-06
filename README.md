## What is Mustgen?
Mustgen is a very simple file generator based on [handlebars](https://github.com/wycats/handlebars.js).
It takes {{mustached}} template and javascript object as a map with values and file definitions, then generates string using handlebars, and writes it to a file.

## Why it exists?
It was created as an alternative code generator for [Entitas](https://github.com/sschmid/Entitas-CSharp).

## Quick start

### 0. Have Node.js installed
If you don't have node.js installed on your machine, install from [Node.js website](https://nodejs.org/en/download/).

### 1. Go to your project path
```bash
$ cd pathToYourProject
```


### 1. Install Mustgen
```bash
$ npm install mustgen --save
```

### 2. Add template `hello.hbs` at root of your project

```handlebars
Hello {{name}}.

Random words: {{#words}}{{.}} {{/words}}

{{#person}}
And this is block of {{name}} {{lastname}}.
{{/person}}
```

### 3. Add `map.js` at root of your project
```javascript
var helloFile = {
    template: 'hello.hbs',
    output: 'hello.txt',
    data: {
        name: "totally useful tool",
        words: ["Lonely", "Sad", "Depressed"],
        person: {
            name: "Stephen",
            lastname: "King"
        }
    }
}

module.exports = {
    files: [helloFile],
    helpers: {},
    partials: {},
    // For safety reasons, output folder name 
    // should contain '_generated'. 
    // This folder will be constantly cleaned.
    output: '_generated'
};
```



### 4. Add `server.js` at root of your project
```javascript
require('mustgen')('./', './map');
```


### 5. Run server
```bash
$ node server
```

### 6. Enjoy
```
Hello totally useful tool.

Random words: Lonely Sad Depressed

And this is block of Stephen King.
```

### Code generation example
Check out [EntitasMustgen](https://github.com/vladpazych/EntitasMustgen), it's a boilerplate for Entitas API generation.

### Handlebars docs
**[Handlebars website](http://handlebarsjs.com/) | [Handlebars GitHub](https://github.com/wycats/handlebars.js)**

<!--## Roadmap-->

## Maintainer
* [@vladpazych](https://github.com/vladpazych)


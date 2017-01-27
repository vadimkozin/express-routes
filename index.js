// express-routing
/*
Создать приложение на Express.js которое будет иметь 5 вариаций роутов

GET / - Главная страница которая вернет код 200 OK и покажет текст "Hello Express.js"
GET /hello - Страница, код ответа 200 OK и покажет текст "Hello stranger !"
GET /hello/[любое имя] - Страница, код ответа 200 OK и покажет текст "Hello, [любое имя] !"
ANY /sub/[что угодно]/[возможно даже так] - Любая из этих страниц должна показать текст "You requested URI: [полный URI запроса]"
POST /post - Страница которая вернет все тело POST запроса (POST body) в JSON формате, либо 404 Not Found - если нет тела запроса

Зачет с отличием:
Добавить в роут POST /post - проверку на наличие Header: Key (на уровне middleware), 
если такого header не существует, то возвращать 401
*/
const express = require("express");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3000;
const app = express();

const log = console.log;

// проверка на наличие Header: Key
function isKeyHeader(req, res, next)  {
    (req.get('Key')) ? next() : res.status(401).send('Header Key not found');
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true}));

// логирование для отладки
app.use((req, res, next) => {
    const uri = req.protocol + '://' + req.get('host') + req.originalUrl;
    log('method:', req.method, ', url:', req.url, ', uri:', uri, ', params:', req.params, ', body:', req.body);
    next();
});

app.get('/', (req, res) => {
    res.send("Hello Express.js"); 
});

app.get('/hello', (req, res) => {
    res.send("Hello stranger !");       
});

app.get('/hello/:name', (req, res) => {
    res.send(`Hello, ${req.params.name}`);    
});

// задание: ANY /sub/[что угодно]/[возможно даже так]
// '/sub/*'  -  простое решение, но пропускает буквально всё что после /sub/
// если же нам нужно только: /sub/...  or /sub/../  or  /sub/../..  or  /sub/../../
// и чтобы: /sub и  /sub/  и  /sub/../../...   считался 'Bad request'
// + учитывались только алфавитно-цифровые символы:
app.all(/^\/sub\/((\w+\/?)|(\w+\/\w+\/?))$/, function(req, res){
    const uri = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.send(`You requested URI: ${uri}`);
});

/*
app.all('/sub/*', (req, res) => {
    const uri = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.send(`+You requested URI: ${uri}`);
});
*/
app.post('/post', isKeyHeader, (req, res) => {
    (Object.keys(req.body).length) ? res.json(req.body): res.status(400).send('Not Found');
});

app.all('*', (req, res) => {
    res.status(400).send('Bad request');
});

app.use((err, req, res, next) => {   
    log(err);
    res.json(err);
});

app.listen(PORT, () => console.log('Start HTTP on port %d', PORT));

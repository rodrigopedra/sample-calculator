const express = require('express');

const app = express();

app.use(express.static('dist'));

app.get('/', (req, res) => {
    res.sendFile('./index.html', {root: __dirname + '/dist/'});
});

app.listen(3000, () => {
    console.log('Server running at: http://localhost:3000/');
});

var app = require('express')(),
	Promise = require('bluebird'),
	r = require('rethinkdbdash')({ db: 'bench', min: 10, max: 20 });

function getUser(token) {
	return r.table('users').getAll(token, { index: 'accessToken' }).limit(1).run().then(function (users) {
		return users[0];
	});
}

function insertAndGet() {
	var p = [];
	['foo', 'bar', 'la', 'bamba'].forEach(function (val) {
		p.push(r.table('data').insert({ value: val }).run());
	});

	return Promise.all(p).then(function () {
		return r.table('data').getAll(['foo', 'bar'], { index: 'value' }).limit(10).run();
	});
}

app.get('/', function (req, res) {
	getUser('foobar').then(insertAndGet).then(function (data) {
		res.send(data);
	});
});

var server = app.listen(3000, function () {
	console.log('listening at http://%s:%s', server.address().address, server.address().port);
});
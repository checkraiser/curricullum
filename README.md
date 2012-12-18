Gem dependencies:
================
- 'resque'
- 'sinatra'
- 'tire'
- 'yajl-ruby'
- 'csv'
- 'savon'
- 'json'
- 'thin' 

Installation presiquites:
========================
- redis server
- elasticsearch server
- node.js

Installtion:
============
- Start Elasticserver
- Start Redis server
- QUEUE=* rake resque:work
- thin -R config.ru start
- node app.js

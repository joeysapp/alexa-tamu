// $.getScript('https://cdn.jsdelivr.net/npm/lodash@4.17.5/lodash.min.js');

var tmp = undefined;
function foo() {
	var today = moment().tz('America/Rainy_River').format('MM/DD/YYYY');
	return $.getJSON('http://12thman.com/services/responsive-calendar.ashx', { type: 'events', sport: 0, date: today }, function (response) {
												// var _sports = response.sports.map
												
												// _sports.unshift({ sport: 0, title: 'All Sports' });
												// self.sports.push.apply(self.sports, _sports);

												console.log('my response was');
												tmp = response;


											});
};
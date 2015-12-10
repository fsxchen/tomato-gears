
tomatoGears.filter('secToTime', function() {
    return function (secs) {
        return new Date(null, null, null, null, null, secs).
            toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0].substring(3);
    }
});

tomatoGears.filter('toCSV', function () {
    return function (pomodoros) {
        var csvText = "data:application/octet-stream,";
        csvText += encodeURIComponent('startime,description,status,endtime\n');
        _.each(pomodoros, function(p){
            csvText += encodeURIComponent(p.startTS+','+p.description+','+p.status+','+p.endTS+'\n');
        });
        return csvText;
    }
});
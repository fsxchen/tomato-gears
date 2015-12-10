/**
 * Created by pedro on 2/13/14.
 */
var tomatoGears = angular.module('tomatoGears', []);

tomatoGears.factory('PomodoroData', function () {
    return {
        action: '',
        label: '番茄一下吧',
        text: '',
        // startTS: 0,
        startTS: 0,
        description: '',
        pomodoroDuration: 1500,             //25 * 60 min
        shortBreakDuration: 300,            //5 * 60
        longBreakDuration: 1200,            //20 * 60
        pomodoros: [],
        pcount: 0
    };
});

tomatoGears.factory('Timer', function($timeout, PomodoroData) {

    var data = {
            value: 0.5*60
        },
        stopwatch = null;

    var stop = function () {
        $timeout.cancel(stopwatch);
        PomodoroData.startTS = 0;
        data.value = 0;
        angular.element("#alert-audio")[0].play();
        stopwatch = null;

    };

    var abort = function () {
        if (PomodoroData.action === 'POMODORO') {
            PomodoroData.pomodoros[PomodoroData.pomodoros.length-1].status = "ABORTED";
            PomodoroData.text = '';
            PomodoroData.pomodoros[PomodoroData.pomodoros.length-1].endTS =  new Date();
            localStorage['pomodoros'] = JSON.stringify(PomodoroData.pomodoros);
        }
        PomodoroData.label = 'Start Pomodoro';
        stop();
    };

    var decideDuration = function() {
        
        if (PomodoroData.action === 'POMODORO') {
            return 5;
            return PomodoroData.pomodoroDuration;
        } else if (PomodoroData.action === 'SHORT_BREAK') {
            return 1;
            return PomodoroData.shortBreakDuration;
        } else { //LONG_BREAK
            return 3;
            return PomodoroData.longBreakDuration;
        }
    };

    var finish = function () {
        if (PomodoroData.action === 'POMODORO') {
            PomodoroData.pomodoros[PomodoroData.pomodoros.length-1].status = "FINISHED";
            PomodoroData.pomodoros[PomodoroData.pomodoros.length-1].endTS =  new Date();
            PomodoroData.text = '';
            localStorage['pomodoros'] = JSON.stringify(PomodoroData.pomodoros);
            PomodoroData.pcount++;
            if (PomodoroData.pcount % 4 === 0) {
                PomodoroData.label = 'Long break';
            } else {
                PomodoroData.label = 'Short Break';
            }
            new Notification("Pomodoro Finished", {
                body: "Nice job! Now go get some well earned rest."
            });
        } else {
            PomodoroData.label = '番茄一下吧';
            new Notification("Break Finished", {
                body: "Break finished, back to work you slacker!"
            });
        }
        stop();
    };
    var timerLoop = function () {
        stopwatch = $timeout(function() {
            var duration = decideDuration();
            // data.value = Math.round(new Date().getTime() / 1000) - PomodoroData.startTS;
            data.value = duration - Math.round(new Date().getTime() / 1000) + PomodoroData.startTS
            if (data.value < 0) {
                finish();
            } else {
                timerLoop();
            }
        }, 100);
    };

    return {
        data: data,
        timerLoop: timerLoop,
        stop: stop,
        abort: abort
    };
});

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

tomatoGears.config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|data):/);
}]);

tomatoGears.controller('PomodoroTimerCtrl', function ($scope, PomodoroData, Timer) {
    $scope.pomodoro = PomodoroData;
    $scope.stopwatch = Timer;
    $scope.startAbort = function () {

	var action2text = function(action) {
        switch (action) {
            case 'LONG_BREAK':
                return 'Long Break';
            case 'SHORT BREAK':
                return 'Break';
            case 'POMODORO':
                return 'Pomodoro';
            default:
                return '';
        }
    } 
        // Request permission for future notifications
        var Notification = window.Notification || window.mozNotification || window.webkitNotification;
        Notification.requestPermission(function (permission) {});

        if ($scope.pomodoro.startTS > 0) {
            $scope.stopwatch.abort();
        } else {
            var startDate = new Date();
            $scope.pomodoro.startTS = Math.round(startDate.getTime() / 1000);
            $scope.pomodoro.label = 'Abort';

            var lastStatus = 'xx';
            var plen = $scope.pomodoro.pomodoros.length;
            if (plen > 0) {
                lastStatus = $scope.pomodoro.pomodoros[plen-1].status;
            }

            if (($scope.pomodoro.action === 'POMODORO') && (lastStatus !== 'ABORTED')) {
                // Start a short break
                if (($scope.pomodoro.pcount > 0) && ($scope.pomodoro.pcount % 4 === 0)) {
                    $scope.pomodoro.action = 'LONG_BREAK';
                } else {
                    $scope.pomodoro.action = 'SHORT_BREAK';
                }
            } else {
                $scope.pomodoro.action = 'POMODORO';
                $scope.pomodoro.pomodoros.push({
                    startTS: startDate,
                    description: $scope.pomodoro.description,
                    status: "IN_PROGRESS",
                    endTS: undefined
                });
                localStorage['pomodoros'] = JSON.stringify($scope.pomodoro.pomodoros);
            }
            $scope.pomodoro.text = action2text($scope.pomodoro.action);
            $scope.stopwatch.timerLoop();
        }
    };

    $scope.resetPomodoros = function() {
        localStorage.clear();
        window.location.href = "/";
    };

    $scope.init = function() {

        if (localStorage['pomodoros'] !== undefined) {
            _.each(JSON.parse(localStorage['pomodoros']), function(el) {
                if (el.status === 'IN_PROGRESS') {
                    el.status = 'ABORTED';
                    $scope.pomodoro.text = '';
                }
                $scope.pomodoro.pomodoros.push({
                    startTS: el.startTS,
                    description: el.description,
                    status: el.status,
                    endTS: el.endTS,
                });
            });
        }

    };
});

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
            value: 25*60
        },
        stopwatch = null;

    var stop = function () {
        $timeout.cancel(stopwatch);
        PomodoroData.startTS = 0;
        data.value = 25*60;
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
        PomodoroData.label = '来个番茄吧';
        stop();
    };

    var decideDuration = function() {

        if (PomodoroData.action === 'POMODORO') {
            return PomodoroData.pomodoroDuration;
        } else if (PomodoroData.action === 'SHORT_BREAK') {
            return PomodoroData.shortBreakDuration;
        } else { //LONG_BREAK
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
            PomodoroData.label = '再来个番茄吧';
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

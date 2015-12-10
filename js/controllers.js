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
            $scope.pomodoro.label = '坚持一下啦';

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

// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

(function () {
    var mousePressed = false;
    var lastX, lastY;
    var el = document.getElementById('canvas');
    console.log(el);
    if (!el) return;
    var ctx = el.getContext('2d');
    var chartCtx = document.getElementById('scoresBarChart').getContext('2d');

    el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        mousePressed = true;
        draw(e, false);
    });
    el.addEventListener('touchstart', function (e) {
        e.preventDefault();
        mousePressed = true;
        draw(e, false);
    });

    el.addEventListener('mousemove', function (e) {
        e.preventDefault();
        if (mousePressed) {
            draw(e, true);
        }
    });
    el.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (mousePressed) {
            draw(e, true);
        }
    });

    el.addEventListener('touchend', stopDrawing);
    el.addEventListener('mouseup', stopDrawing);
    el.addEventListener('touchcancel', stopDrawing);
    el.addEventListener('mouseleave', stopDrawing);
    function stopDrawing(e) {
        e.preventDefault();
        mousePressed = false;
    }

    function draw(e, isDown) {
        var x =
            (e.clientX || e.touches[0].clientX) +
            (document.documentElement.scrollLeft || document.body.scrollLeft) -
            el.offsetLeft;
        var y =
            (e.clientY || e.touches[0].clientY) +
            (document.documentElement.scrollTop || document.body.scrollTop) -
            el.offsetTop;
        if (isDown) {
            ctx.beginPath();
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = '32';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
        }
        lastX = x;
        lastY = y;
    }

    $('#clearArea').click(function () {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        $('#prediction').text('?');
        $('#scores').text('');
    });

    $(".correctNumber").click(function (evt, btn) {
        var correctNumber = evt.currentTarget.dataset.number;

        $.ajax({
            type: 'POST',
            url: 'home/CorrectResult',
            data: {
                number: correctNumber,
                pixelValues: $("#pixies").text()
            }
        }).done(function (msg) {
            alert("TRAINED with " + correctNumber);
        });
    });

    $('#check').click(function () {
        $('#prediction').text('?');
        $.ajax({
            type: 'POST',
            url: 'home/upload',
            data: {
                base64Image: el.toDataURL()
            }
        }).done(function (msg) {
            $("#pixies").text(msg.pixelValues);
            $('#prediction').text(msg.prediction);
            $('#scores').text(JSON.stringify(msg.scores));

            var barChart = new Chart(chartCtx, {
                type: 'bar',
                data: {
                    labels: msg.scores.map(s => s.digit),
                    datasets: [{
                        label: 'Score',
                        data: msg.scores.map(s => s.score),
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        });
    });
})();
jQuery(function($) {

    var $form = $('form#form-request');

    if($form.get(0)) {

        var $request = $form.find('input#request');
        var $response = $('ul#response');

        var socket = io();
        socket.on('message', function(msg){
            $response.append($('<li>').html(msg));
        });

        $form.submit(function(){
            if($request.val()) {
                socket.emit('message', $request.val());
                $request.val('');
            }
            return false;
        });
    }
});

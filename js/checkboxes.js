

let button = document.getElementById('confirmModal');

$("#agreeToAll").click(function() {
    $("input[type=checkbox]").prop("checked", $(this).prop("checked"));
    button.disabled = false;
});

$("input[type=checkbox]").click(function() {
    if (!$(this).prop("checked")) {
        $("#agreeToAll").prop("checked", false);
        button.disabled = true
    }
});

$(".option").change(function(){
    if ($('.option:checked').length == $('.option').length) {
        button.disabled = false;
    }
});

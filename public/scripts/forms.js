$(function() {

  const currentBoard = $('#board-hidden').attr('value');
  const threadsUrl = '/api/threads/' + currentBoard;
  const repliesUrl = '/api/replies/' + currentBoard;

  // New Thread
  $('#newThread').submit(function() {
    $(this).attr('action', threadsUrl);
  });

  // New Reply
  $('#newReply').submit(function(e) {
    $.ajax({
      method: "POST",
      url: repliesUrl,
      data: $(this).serialize(),
      success: function(data) { location.reload(); }
    });
    e.preventDefault();
  });

  // Report Thread
  $('#board-display').on('submit','#reportThread', function(e) {
    $.ajax({
      method: "PUT",
      url: threadsUrl,
      data: $(this).serialize(),
      success: function(data) { alert(data); }
    });
    e.preventDefault();
  });

  // Report Reply
  $('#board-display').on('submit','#reportReply', function(e) {
    $.ajax({
      method: "PUT",
      url: repliesUrl,
      data: $(this).serialize(),
      success: function(data) { alert(data); }
    });
    e.preventDefault();
  });

  // Delete Thread
  $('#board-display').on('submit','#deleteThread', function(e) {
    $.ajax({
      method: "DELETE",
      url: threadsUrl,
      data: $(this).serialize(),
      success: function(data) {
        alert(data);
        window.location.href = '/' + currentBoard;
      }
    });
    e.preventDefault();
  });

  // Delete Reply
  $('#board-display').on('submit','#deleteReply', function(e) {
    $.ajax({
      method: "DELETE",
      url: repliesUrl,
      data: $(this).serialize(),
      success: function(data) {
        alert(data);
        location.reload();
      }
    });
    e.preventDefault();
  });
});

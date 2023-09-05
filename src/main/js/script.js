function togglePopup(popupId, title) {
    var blur = document.getElementById('blur');
    var popup = document.getElementById(popupId);

    if (blur.classList.contains('active') || popup.classList.contains('active')) {
        blur.classList.remove('active');
        popup.classList.remove('active');
    } else {
        blur.classList.add('active');
        popup.classList.add('active');

        // 设置弹出窗口的标题
        var popupTitle = document.querySelector(`#${popupId} h1, #${popupId} h2`);
        if (popupTitle) {
            popupTitle.textContent = title;
        }
    }
}

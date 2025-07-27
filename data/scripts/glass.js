{
  let released = false;
  let animationId;

  const release = div => {
    cancelAnimationFrame(animationId);
    removeEventListener('mousemove', div.mousemove);
    removeEventListener('scrollend', div.capture);
    removeEventListener('click', div.release);
    removeEventListener('keydown', div.keydown);
    div.remove();
    chrome.runtime.sendMessage({
      cmd: 'release'
    });
  };

  for (const div of document.querySelectorAll('.mgnfng-glss')) {
    release(div);
    released = true;
  }
  if (released === false) {
    chrome.storage.local.get({
      magnification: 2,
      size: 200
    }, prefs => {
      const div = document.createElement('div');
      div.classList.add('mgnfng-glss');
      document.documentElement.append(div);

      const update = src => {
        const scale = prefs.magnification / devicePixelRatio;
        div.style.scale = scale;
        div.style.width = div.style.height = prefs.size / scale + 'px';
        div.style['background-image'] = 'url(' + src + ')';
      };

      const hs = prefs.size / 2;
      let e;
      div.mousemove = _e => {
        e = _e;
        if (animationId) {
          return;
        }
        // Schedule the next frame only if it's not already scheduled
        animationId = requestAnimationFrame(() => {
          div.style.left = (e.clientX - hs) + 'px';
          div.style.top = (e.clientY - hs) + 'px';
          div.style['background-position'] = (hs - e.clientX * devicePixelRatio) + 'px ' + (hs - e.clientY * devicePixelRatio) + 'px';

          animationId = null;
        });
      };
      div.capture = () => {
        div.classList.add('hidden');

        chrome.runtime.sendMessage({
          cmd: 'capture'
        }, src => {
          update(src);
          div.classList.remove('hidden');
        });
      };
      div.release = () => {
        release(div);
      };
      div.keydown = e => {
        if (e.key === 'Escape') {
          div.release();
        }
      };
      addEventListener('mousemove', div.mousemove);
      addEventListener('scrollend', div.capture);
      addEventListener('click', div.release);
      addEventListener('keydown', div.keydown);
      div.capture();
    });
  }
}

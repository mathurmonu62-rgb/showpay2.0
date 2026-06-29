export class LoaderComponent {
    static show() {
        let l = document.getElementById('global-loader');
        if (!l) {
            l = document.createElement('div');
            l.id = 'global-loader';
            l.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(255,255,255,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:var(--primary);';
            l.innerText = 'Loading...';
            document.body.appendChild(l);
        }
        l.style.display = 'flex';
    }

    static hide() {
        const l = document.getElementById('global-loader');
        if (l) l.style.display = 'none';
    }
}

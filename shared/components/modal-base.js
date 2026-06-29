export class ModalBase {
    static create(id, contentHTML) {
        let existing = document.getElementById(id);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-overlay';
        modal.innerHTML = `<div class="modal-content">${contentHTML}</div>`;
        document.body.appendChild(modal);
        return modal;
    }

    static show(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    static hide(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }
}

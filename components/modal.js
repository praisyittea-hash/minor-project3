class ModalManager {
  constructor() {
    this.activeModal = null;
    this.initGlobalEvents();
  }

  initGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.close();
      }
    });
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    this.activeModal = modal;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.activeModal) return;

    this.activeModal.classList.remove('active');
    this.activeModal = null;
    document.body.style.overflow = '';
  }
}

export const Modal = new ModalManager();

/* ============================================
   FORMULÁRIO DE AGENDAMENTO — STUDIO AURA
   ============================================ */
   (function () {
    'use strict';
  
    /* ---------------------------------------------------------
       ⚙️ CONFIGURAÇÃO — troque pelo número real do Studio Aura
       Formato: DDI + DDD + número (só dígitos, sem +, espaço ou traço)
       Ex.: 55 (Brasil) + 15 (Sorocaba) + 999999999
       --------------------------------------------------------- */
    const WHATSAPP_NUMBER = '5515999999999';
  
    /* ---------- Referências ---------- */
    const modal     = document.getElementById('bookingModal');
    const form      = document.getElementById('bookingForm');
    const openBtns  = document.querySelectorAll('[data-open-booking]');
    const closeBtns = document.querySelectorAll('[data-close-booking]');
  
    if (!modal || !form) return;
  
    /* ---------- Utilitários ---------- */
    const formatDate = (isoDate) => {
      if (!isoDate) return '';
      const [y, m, d] = isoDate.split('-');
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      });
    };
  
    const showError = (fieldName, message) => {
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      const fieldEl = errorEl?.closest('.form-field');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
      }
      fieldEl?.classList.add('has-error');
    };
  
    const clearError = (fieldName) => {
      const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
      const fieldEl = errorEl?.closest('.form-field');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
      }
      fieldEl?.classList.remove('has-error');
    };
  
    const clearAllErrors = () => {
      ['clientName', 'procedure', 'preferredDate', 'period'].forEach(clearError);
    };
  
    /* ---------- Validação ---------- */
    const validateForm = () => {
      clearAllErrors();
      let isValid = true;
      let firstInvalid = null;
  
      // Nome
      const name = form.clientName.value.trim();
      if (!name) {
        showError('clientName', 'Por favor, informe seu nome.');
        isValid = false;
        firstInvalid ||= form.clientName;
      } else if (name.length < 3) {
        showError('clientName', 'O nome precisa ter pelo menos 3 letras.');
        isValid = false;
        firstInvalid ||= form.clientName;
      } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(name)) {
        showError('clientName', 'Use apenas letras e espaços.');
        isValid = false;
        firstInvalid ||= form.clientName;
      }
  
      // Procedimento
      if (!form.procedure.value) {
        showError('procedure', 'Selecione um procedimento.');
        isValid = false;
        firstInvalid ||= form.procedure;
      }
  
      // Data
      const date = form.preferredDate.value;
      if (!date) {
        showError('preferredDate', 'Escolha um dia de preferência.');
        isValid = false;
        firstInvalid ||= form.preferredDate;
      } else {
        const chosen = new Date(date + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (chosen < today) {
          showError('preferredDate', 'Escolha uma data a partir de hoje.');
          isValid = false;
          firstInvalid ||= form.preferredDate;
        }
      }
  
      // Período
      const period = form.querySelector('input[name="period"]:checked');
      if (!period) {
        showError('period', 'Escolha o período de preferência.');
        isValid = false;
      }
  
      if (!isValid && firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
      }
  
      return isValid;
    };
  
    /* ---------- Monta a mensagem do WhatsApp ---------- */
    const buildWhatsAppMessage = (data) => {
      const lines = [
        'Olá! Gostaria de agendar uma avaliação no Studio Aura.',
        '',
        `👤 Nome: ${data.name}`,
        `✨ Interesse: ${data.procedure}`,
        `🗓️ Preferência: ${data.dateFormatted} · ${data.period}`,
      ];
      return lines.join('\n');
    };
  
    /* ---------- Submit ---------- */
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      if (!validateForm()) return;
  
      const name      = form.clientName.value.trim();
      const procedure = form.procedure.value;
      const rawDate   = form.preferredDate.value;
      const period    = form.querySelector('input[name="period"]:checked').value;
  
      const message = buildWhatsAppMessage({
        name,
        procedure,
        dateFormatted: formatDate(rawDate),
        period,
      });
  
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  
      // Estado de carregamento no botão
      const submitBtn = form.querySelector('.booking-form__submit');
      submitBtn.classList.add('is-loading');
  
      // Pequeno delay para o feedback visual aparecer antes do redirect
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
        submitBtn.classList.remove('is-loading');
      }, 400);
    });
  
    /* ---------- Limpa erro ao digitar/escolher ---------- */
    form.clientName.addEventListener('input',    () => clearError('clientName'));
    form.procedure.addEventListener('change',    () => clearError('procedure'));
    form.preferredDate.addEventListener('change',() => clearError('preferredDate'));
    form.querySelectorAll('input[name="period"]').forEach((radio) => {
      radio.addEventListener('change', () => clearError('period'));
    });
  
    /* ---------- Abrir / fechar modal ---------- */
    const openModal = () => {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-modal-open');
      // Foco no primeiro campo
      setTimeout(() => form.clientName.focus(), 120);
    };
  
    const closeModal = () => {
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-modal-open');
      // Aguarda animação antes de esconder
      setTimeout(() => { modal.hidden = true; }, 200);
    };
  
    openBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });
  
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });
  
    /* ---------- ESC fecha ---------- */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  
    /* ---------- Define data mínima = hoje ---------- */
    const today = new Date().toISOString().split('T')[0];
    form.preferredDate.min = today;
  
    /* ---------- Foco preso no modal (acessibilidade) ---------- */
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modal.querySelectorAll(
        'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
  
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  })();
'use client';

import React, { useState, useRef } from 'react';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '../types/sanity';
import { portableTextComponents } from '../utils/portableTextComponents';

type FormFieldBase = {
  _type: string;
  _key?: string;
  label?: string;
  required?: boolean;
  halfWidth?: boolean;
};

type TextInputField = FormFieldBase & { _type: 'textInput' };
type EmailInputField = FormFieldBase & { _type: 'emailInput' };
type TextareaField = FormFieldBase & { _type: 'textarea' };
type SelectField = FormFieldBase & {
  _type: 'select';
  options?: Array<{ _key?: string; option?: string } | string>;
};

type FormField = TextInputField | EmailInputField | TextareaField | SelectField;

type FormProps = {
  title?: string;
  introduction?: PortableTextBlock[];
  formFields?: FormField[];
  submitLabel?: string;
  successMessage?: string;
  adminNotificationEmail?: string;
};

function sanitizeFieldName(label: string | undefined): string {
  if (!label) return '';
  return label.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, '-');
}

function getSelectOptionValue(option: { _key?: string; option?: string } | string): string {
  return typeof option === 'string' ? option : (option?.option ?? '');
}

const Form: React.FC<FormProps> = ({
  title,
  introduction,
  formFields = [],
  submitLabel = 'Submit',
  successMessage = 'Thank you for getting in touch!',
  adminNotificationEmail,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(false);
  const [formSending, setFormSending] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setFormSending(true);
    setFormError(false);

    const formData = new FormData(formRef.current);
    const formDataObject: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObject[key] = String(value);
    });

    // Honeypot
    if (formDataObject['usercode']) {
      setFormSending(false);
      return;
    }

    // Pass CMS-configured title and recipient so API can use them
    if (title) formDataObject['_formTitle'] = title;
    if (adminNotificationEmail) formDataObject['_toEmailAddress'] = adminNotificationEmail;
    // So the recipient can hit "Reply" to respond to the submitter
    const emailField = formFields.find((f) => f._type === 'emailInput');
    const emailFieldName = emailField && sanitizeFieldName(emailField.label);
    if (emailFieldName && formDataObject[emailFieldName]) formDataObject['_replyToEmail'] = formDataObject[emailFieldName];

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDataObject),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const msg = data?.details ?? data?.error ?? 'Failed to submit form'
          throw new Error(msg)
        }
        return data
      })
      .then(() => {
        if (typeof window !== 'undefined') window.scrollTo({ top: 0 })
        setFormSuccess(true)
        setFormMessage(successMessage)
      })
      .catch((err: unknown) => {
        setFormSending(false)
        setFormError(true)
        setFormMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      })
  }

  const selectClass = `[background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='15' viewBox='0 0 28 15' fill='none'%3E%3Cpath d='M27 0.999979L14 14L1.00002 0.999979' stroke='%23141313'/%3E%3C/svg%3E")]`;

  return (
    <section className="contact-form-block h-pad row-lg">
      <div className="col-3-12_lg desktop"></div>
      
      <div className="col-6-12_lg out-of-view">
        {introduction && introduction.length > 0 && (
          <div className="text-wrap">
            <PortableText value={introduction} components={portableTextComponents} />
          </div>
        )}

        <form
          ref={formRef}
          method="post"
          onSubmit={handleSubmit}
          style={{ display: formSuccess ? 'none' : undefined }}
        >
          <input
            type="text"
            name="usercode"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
          />

          {formFields.map((field, index) => {
            const name = sanitizeFieldName(field.label);
            const key = field._key ?? `field-${index}`;

            const fieldClassName = field.halfWidth ? 'form-field form-field--half' : 'form-field';

            if (field._type === 'textInput') {
              return (
                <div key={key} className={fieldClassName}>
                  <input
                    type="text"
                    name={name}
                    placeholder={field.label}
                    required={!!field.required}
                    aria-label={field.label}
                  />
                </div>
              );
            }

            if (field._type === 'emailInput') {
              return (
                <div key={key} className={fieldClassName}>
                  <input
                    type="email"
                    name={name}
                    placeholder={field.label}
                    required={!!field.required}
                    aria-label={field.label}
                  />
                </div>
              );
            }

            if (field._type === 'textarea') {
              return (
                <div key={key} className="form-field">
                  <textarea
                    name={name}
                    placeholder={field.label}
                    required={!!field.required}
                    rows={5}
                    aria-label={field.label}
                  />
                </div>
              );
            }

            if (field._type === 'select' && 'options' in field) {
              const options = field.options ?? [];
              return (
                <div key={key} className={fieldClassName}>
                  <select
                    name={name}
                    required={!!field.required}
                    aria-label={field.label}
                    className={selectClass}
                  >
                    <option value="">
                      {field.label ?? 'Select...'}
                    </option>
                    {options.map((opt, i) => {
                      const value = getSelectOptionValue(opt);
                      return (
                        <option key={typeof opt === 'object' && opt?._key ? opt._key : i} value={value}>
                          {value}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            }

            return null;
          })}

          <div className="form-field">
            <button
              type="submit"
              disabled={formSending}
              // className="mt-2 px-6 py-4 font-mono text-sm uppercase tracking-wider bg-[var(--color-green,#2d5016)] text-[var(--color-beige,#f5f0eb)] border-none cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        </form>

        {formSuccess && <div>{formMessage}</div>}
        {formError && <div>{formMessage}</div>}
      </div>

      <div className="col-3-12_lg desktop"></div>
    </section>
  );
};

export default Form;

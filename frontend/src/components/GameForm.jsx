import { useRef, useState } from "react";
import { genres, platforms } from "../data/games.js";
import { normalizeGame, validateGame } from "../lib/games.js";

export default function GameForm({ game, onSave, onCancel }) {
  const [values, setValues] = useState(
    game ?? { titulo: "", genero: "", plataforma: "", ano: "", preco: "" },
  );
  const [errors, setErrors] = useState({});
  const form = useRef(null);
  function submit(event) {
    event.preventDefault();
    const validation = validateGame(values);
    setErrors(validation);
    if (Object.keys(validation).length) {
      form.current.elements.namedItem(Object.keys(validation)[0]).focus();
      return;
    }
    onSave(normalizeGame(values));
  }
  function field(name, label, options) {
    const props = {
      id: name,
      name,
      value: values[name],
      onChange: (event) => setValues({ ...values, [name]: event.target.value }),
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
      required: true,
    };
    return (
      <div className={name === "titulo" ? "form-field full" : "form-field"}>
        <label htmlFor={name}>{label}</label>
        {options ? (
          <select {...props}>
            <option value="">Selecione</option>
            {[
              ...new Set([...options, ...(values[name] ? [values[name]] : [])]),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        ) : (
          <input
            {...props}
            type={name === "titulo" ? "text" : "number"}
            placeholder={
              name === "titulo"
                ? "Como se chama o jogo?"
                : name === "ano"
                  ? "Ex.: 2026"
                  : "0,00"
            }
            step={name === "preco" ? "0.01" : "1"}
          />
        )}
        {errors[name] && (
          <span className="field-error" id={`${name}-error`}>
            {errors[name]}
          </span>
        )}
      </div>
    );
  }
  return (
    <form ref={form} onSubmit={submit} noValidate>
      <div className="form-grid">
        {field("titulo", "Título")}
        {field("genero", "Gênero", genres)}
        {field("plataforma", "Plataforma", platforms)}
        {field("ano", "Ano de lançamento")}
        {field("preco", "Preço (R$)")}
      </div>
      <p className="form-note">
        Todos os campos são obrigatórios. Os dados ficam apenas nesta sessão.
      </p>
      <div className="modal-actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="button primary">
          {game ? "Salvar alterações" : "Adicionar jogo"}
        </button>
      </div>
    </form>
  );
}

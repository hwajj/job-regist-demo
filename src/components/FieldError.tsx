type Props = {
  message?: string;
};

export function FieldError({ message }: Props) {
  if (!message) return null;
  return <p style={{ color: 'crimson' }}>{message}</p>;
}

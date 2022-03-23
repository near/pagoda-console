import { Spinner } from 'react-bootstrap';

export default function BorderSpinner() {
  return (
    <Spinner style={{ margin: 'auto' }} animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}

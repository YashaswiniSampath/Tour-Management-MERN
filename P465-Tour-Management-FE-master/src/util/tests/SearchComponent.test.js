import renderer from 'react-test-renderer';
import LoginNavComponent from '../LoginNavComponent';
import { BrowserRouter as Router } from 'react-router-dom';

it('renders page', () => {
    const component = renderer.create(
        <Router><LoginNavComponent /></Router>
    )
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
})
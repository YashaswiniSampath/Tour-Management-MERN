import renderer from 'react-test-renderer';
import SignIn from '../SignIn';
import { BrowserRouter as Router } from 'react-router-dom';

it('renders page', () => {
    const component = renderer.create(
        <Router><SignIn /></Router>
    )
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
})
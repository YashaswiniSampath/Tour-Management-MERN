import renderer from 'react-test-renderer';
import Footer from '../Footer';

it('renders page', () => {
    const component = renderer.create(
        <Footer />
    )
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
})
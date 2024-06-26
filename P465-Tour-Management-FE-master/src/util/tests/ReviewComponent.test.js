import renderer from 'react-test-renderer';
import ReviewComponent from '../ReviewComponent';

it('renders page', () => {
    const component = renderer.create(
        <ReviewComponent location={{name: "Test name"}}/>
    )
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
})
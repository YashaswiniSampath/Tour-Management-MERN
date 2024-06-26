import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SignUp from '../SignUp';

describe('SignUp component', () => {
  it('renders page', () => {
    const { asFragment } = render(
      <Router>
        <SignUp />
      </Router>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
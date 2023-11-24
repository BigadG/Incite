import React from 'react';
import { render, screen } from '@testing-library/react';
import Comment from './Comment';

   test('Comment component is rendered correctly', () => {
      render(<Comment 
               name={'Jake'} 
                description={'My blog comment'}/>);

      expect( 
             screen.getByText('Jake says')
             ).toBeInTheDocument();
      expect(
             screen.getByText('My blog comment')
             ).toBeInTheDocument();
   });
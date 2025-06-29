import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Mi50Game from '../mi50_game';

vi.mock('../AudioPreloader', () => ({
  useAudioPreloader: () => ({
    playPreloadedSound: () => {},
    isLoading: false,
    loadProgress: 100,
  }),
}));

describe('Mi50Game', () => {
  it('renders without crashing', () => {
    const { container } = render(<Mi50Game />);
    expect(container).toBeTruthy();
  });
});

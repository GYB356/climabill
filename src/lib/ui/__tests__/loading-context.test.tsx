import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { LoadingProvider, useLoading, useLoadingOperation } from '../loading-context';

// Test component that uses the loading hooks
function LoadingConsumer() {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const { 
    isLoading: isUserLoading, 
    withLoading: withUserLoading 
  } = useLoadingOperation('user');
  
  const { 
    isLoading: isDataLoading, 
    withLoading: withDataLoading 
  } = useLoadingOperation('data');
  
  const startGlobalLoading = () => startLoading('global');
  const stopGlobalLoading = () => stopLoading('global');
  
  const startUserLoading = () => startLoading('user');
  const stopUserLoading = () => stopLoading('user');
  
  const simulateUserOperation = async () => {
    await withUserLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'user data';
    });
  };
  
  const simulateDataOperation = async () => {
    await withDataLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'app data';
    });
  };
  
  const simulateErrorOperation = async () => {
    try {
      await withDataLoading(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        throw new Error('Test error');
      });
    } catch (error) {
      // Error is expected in test
    }
  };

  return (
    <div>
      <div data-testid="globalLoading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="userLoading">{isUserLoading ? 'true' : 'false'}</div>
      <div data-testid="dataLoading">{isDataLoading ? 'true' : 'false'}</div>
      
      <button onClick={startGlobalLoading} data-testid="startGlobalLoading">
        Start Global Loading
      </button>
      
      <button onClick={stopGlobalLoading} data-testid="stopGlobalLoading">
        Stop Global Loading
      </button>
      
      <button onClick={startUserLoading} data-testid="startUserLoading">
        Start User Loading
      </button>
      
      <button onClick={stopUserLoading} data-testid="stopUserLoading">
        Stop User Loading
      </button>
      
      <button onClick={simulateUserOperation} data-testid="simulateUserOperation">
        Simulate User Operation
      </button>
      
      <button onClick={simulateDataOperation} data-testid="simulateDataOperation">
        Simulate Data Operation
      </button>
      
      <button onClick={simulateErrorOperation} data-testid="simulateErrorOperation">
        Simulate Error Operation
      </button>
    </div>
  );
}

describe('LoadingContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should provide initial loading state as false', () => {
    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    );

    expect(screen.getByTestId('globalLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('userLoading')).toHaveTextContent('false');
    expect(screen.getByTestId('dataLoading')).toHaveTextContent('false');
  });

  it('should update global loading state', async () => {
    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    );

    // Start global loading
    act(() => {
      screen.getByTestId('startGlobalLoading').click();
    });
    
    expect(screen.getByTestId('globalLoading')).toHaveTextContent('true');
    
    // Stop global loading
    act(() => {
      screen.getByTestId('stopGlobalLoading').click();
    });
    
    expect(screen.getByTestId('globalLoading')).toHaveTextContent('false');
  });

  it('should update specific operation loading state', async () => {
    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    );

    // Start user loading
    act(() => {
      screen.getByTestId('startUserLoading').click();
    });
    
    expect(screen.getByTestId('userLoading')).toHaveTextContent('true');
    expect(screen.getByTestId('dataLoading')).toHaveTextContent('false');
    
    // Stop user loading
    act(() => {
      screen.getByTestId('stopUserLoading').click();
    });
    
    expect(screen.getByTestId('userLoading')).toHaveTextContent('false');
  });

  it('should handle loading state during async operations', async () => {
    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    );

    // Start user operation
    act(() => {
      screen.getByTestId('simulateUserOperation').click();
    });
    
    // Loading should be true immediately
    expect(screen.getByTestId('userLoading')).toHaveTextContent('true');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('userLoading')).toHaveTextContent('false');
    });
  });

  it('should handle multiple simultaneous loading operations', async () => {
    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    );

    // Start both operations
    act(() => {
      screen.getByTestId('simulateUserOperation').click();
      screen.getByTestId('simulateDataOperation').click();
    });
    
    // Both should be loading
    expect(screen.getByTestId('userLoading')).toHaveTextContent('true');
    expect(screen.getByTestId('dataLoading')).toHaveTextContent('true');
    
    // Global loading should also be true
    expect(screen.getByTestId('globalLoading')).toHaveTextContent('true');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('userLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('dataLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('globalLoading')).toHaveTextContent('false');
    });
  });

  it('should properly reset loading state after errors', async () => {
    render(
      <LoadingProvider>
        <LoadingConsumer />
      </LoadingProvider>
    );

    // Start operation that will fail
    act(() => {
      screen.getByTestId('simulateErrorOperation').click();
    });
    
    // Loading should be true initially
    expect(screen.getByTestId('dataLoading')).toHaveTextContent('true');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // After error, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('dataLoading')).toHaveTextContent('false');
    });
  });
});

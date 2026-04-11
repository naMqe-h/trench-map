import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'

vi.mock('@/store/useMapStore', () => ({
    useMapStore: vi.fn((selector) => selector({
        villages: [],
        generationStep: null,
        setGenerationStep: vi.fn()
    }))
}))

vi.mock('@/actions/addToken', () => ({
    addToken: vi.fn()
}))

vi.mock('react-toastify', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn()
    }
}))

describe('TopBar', () => {
    const defaultProps = {
        setNewVillageData: vi.fn()
    }

    it('should have the Search button disabled when the input field is empty', () => {
        render(<TopBar {...defaultProps} />)
        const button = screen.getByRole('button', { name: /search/i })
        expect(button).toBeDisabled()
    })

    it('should render an error message when state indicates failure', async () => {
        const { addToken } = await import('@/actions/addToken')
        vi.mocked(addToken).mockResolvedValue({ success: false, error: 'Failed to process token' })

        render(<TopBar {...defaultProps} />)
        
        const input = screen.getByPlaceholderText(/enter contract address/i)
        const button = screen.getByRole('button', { name: /search/i })

        fireEvent.change(input, { target: { value: 'invalid-address' } })
        fireEvent.click(button)

        const errorMessage = await screen.findByText(/failed to process token/i)
        expect(errorMessage).toBeInTheDocument()
    })
})

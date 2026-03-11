import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'

vi.mock('@/actions/processToken', () => ({
    processToken: vi.fn()
}))

describe('TopBar', () => {
    const defaultProps = {
        onTokenProcessed: vi.fn(),
        generationStep: null
    }

    it('should have the Search button disabled when the input field is empty', () => {
        render(<TopBar {...defaultProps} />)
        const button = screen.getByRole('button', { name: /search/i })
        expect(button).toBeDisabled()
    })

    it('should disable the input field when a generationStep state is passed', () => {
        render(<TopBar {...defaultProps} generationStep="fetching" />)
        const input = screen.getByPlaceholderText(/enter contract address/i)
        expect(input).toBeDisabled()
    })

    it('should correctly display "Building structures..." based on the generationStep', () => {
        render(<TopBar {...defaultProps} generationStep="building" />)
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Building structures...')
    })

    it('should render an error message when state indicates failure', async () => {
        const { processToken } = await import('@/actions/processToken')
        vi.mocked(processToken).mockResolvedValue({ success: false } as any)

        render(<TopBar {...defaultProps} />)
        
        const input = screen.getByPlaceholderText(/enter contract address/i)
        const button = screen.getByRole('button', { name: /search/i })

        fireEvent.change(input, { target: { value: 'invalid-address' } })
        fireEvent.click(button)

        const errorMessage = await screen.findByText(/failed to process token/i)
        expect(errorMessage).toBeInTheDocument()
    })
})

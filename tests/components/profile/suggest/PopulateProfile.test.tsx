// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PopulateProfile } from '../../../../src/components/profile/suggest/PopulateProfile';
import type { PopulateSubmission } from '../../../../src/components/profile/suggest/PopulateProfile';
import { INPUT_LIMITS } from '../../../../src/components/profile/suggest/types';

afterEach(cleanup);

function setup(onSubmit = vi.fn(async (_: PopulateSubmission) => {})) {
  const user = userEvent.setup();
  render(<PopulateProfile onSubmit={onSubmit} />);
  return { user, onSubmit };
}

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Populate My Profile' }));
  return screen.getByRole('dialog', { name: 'Populate My Profile' });
}

const permission = () => screen.getByRole('checkbox', { name: /permission to use the materials/i });
const submitButton = () => screen.getByRole('button', { name: 'Suggest entries' });
const resumeInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

describe('PopulateProfile', () => {
  it('opens from a clearly labeled button and focuses the bio field', async () => {
    const { user } = setup();
    await open(user);
    expect(screen.getByLabelText('Professional biography')).toHaveFocus();
  });

  it('requires the permission checkbox', async () => {
    const { user, onSubmit } = setup();
    await open(user);
    await user.type(screen.getByLabelText('Professional biography'), 'Director based in Atlanta.');
    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/confirm you have permission/i)).toBeInTheDocument();
  });

  it('requires at least one material', async () => {
    const { user, onSubmit } = setup();
    await open(user);
    await user.click(permission());
    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/add a bio, a credit list, or a document/i)).toBeInTheDocument();
  });

  it('submits trimmed bio and credit list separately, with normalized reference links', async () => {
    const { user, onSubmit } = setup();
    await open(user);
    await user.type(screen.getByLabelText('Professional biography'), '  Producer.  ');
    await user.type(screen.getByLabelText('Full credit list'), 'Harbor Lights (2004) - Producer');
    await user.type(screen.getByLabelText('IMDb'), 'imdb.com/name/nm0000001/');
    await user.click(permission());
    await user.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith({
      bioText: 'Producer.',
      creditListText: 'Harbor Lights (2004) - Producer',
      resumeFile: null,
      references: { linkedin: null, imdb: 'https://imdb.com/name/nm0000001/' },
      permissionConfirmed: true,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('rejects links to the wrong site and blocks submit', async () => {
    const { user, onSubmit } = setup();
    await open(user);
    await user.type(screen.getByLabelText('Professional biography'), 'Bio');
    await user.type(screen.getByLabelText('LinkedIn'), 'https://linkedin.com.evil.example/in/x');
    await user.click(permission());
    await user.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/enter a linkedin link/i)).toBeInTheDocument();
  });

  it('accepts a .docx résumé and lets the member remove it', async () => {
    const { user, onSubmit } = setup();
    await open(user);
    const file = new File(['PK'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    await user.upload(resumeInput(), file);
    expect(screen.getByText('resume.docx')).toBeInTheDocument();
    await user.click(permission());
    await user.click(submitButton());
    expect(onSubmit.mock.calls[0][0].resumeFile).toBe(file);
  });

  it('rejects unsupported and oversized files', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<PopulateProfile onSubmit={vi.fn()} />);
    await open(user);
    await user.upload(resumeInput(), new File(['x'], 'resume.doc'));
    expect(screen.getByRole('alert')).toHaveTextContent(/PDF or Word/);
    const big = new File(['x'], 'resume.pdf');
    Object.defineProperty(big, 'size', { value: INPUT_LIMITS.resumeBytes + 1 });
    await user.upload(resumeInput(), big);
    expect(screen.getByRole('alert')).toHaveTextContent(/limit is 3 MB/);
  });

  it('keeps the dialog open and shows the error when submission fails', async () => {
    const { user } = setup(vi.fn(async () => { throw new Error("We couldn't read that file."); }));
    await open(user);
    await user.type(screen.getByLabelText('Professional biography'), 'Bio');
    await user.click(permission());
    await user.click(submitButton());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText("We couldn't read that file.")).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the button', async () => {
    const { user } = setup();
    await open(user);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Populate My Profile' })).toHaveFocus();
  });

  it('shows the photo control only when the photo feature supplies one', async () => {
    const user = userEvent.setup();
    render(<PopulateProfile onSubmit={vi.fn()} photoSlot={<button type="button">Change photo</button>} />);
    await open(user);
    expect(screen.getByRole('button', { name: 'Change photo' })).toBeInTheDocument();
  });
});

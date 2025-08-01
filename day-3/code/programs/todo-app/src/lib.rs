use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Replace with your program's ID

#[program]
pub mod todo_app {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.authority = ctx.accounts.authority.key();
        user_profile.last_todo = 0;
        user_profile.todo_count = 0;
        Ok(())
    }

    pub fn add_todo(ctx: Context<AddTodo>, content: String) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.todos.push(TodoItem {
            content,
            completed: false,
        });
        user_profile.last_todo += 1;
        user_profile.todo_count += 1;
        Ok(())
    }

    // THIS IS THE CORRECT, WORKING FUNCTION
    pub fn toggle_todo(ctx: Context<ToggleTodo>, todo_idx: u8) -> Result<()> {
        let todo_idx = todo_idx as usize;
        ctx.accounts.user_profile.todos[todo_idx].completed = !ctx.accounts.user_profile.todos[todo_idx].completed;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        seeds = [b"user_profile", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + 32 + 1 + 4 + 200 // Adjust space as needed
    )]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddTodo<'info> {
    #[account(mut, has_one = authority)]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

// THIS IS THE CORRECT, WORKING CONTEXT STRUCT
#[derive(Accounts)]
pub struct ToggleTodo<'info> {
    #[account(mut, has_one = authority)]
    pub user_profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub authority: Signer<'info>,
}


#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub last_todo: u8,
    pub todo_count: u8,
    pub todos: Vec<TodoItem>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TodoItem {
    pub content: String,
    pub completed: bool,
}
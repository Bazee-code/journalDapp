#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod cruddapp {
    use super::*;

    

}

#[account]
#[derive(InitSpace)]
  pub struct JournalEntryState {
    pub owner : Pubkey,
    #[max_len(50)]
    pub title : String,
    #[max_len(1000)]
    pub message : String,
}

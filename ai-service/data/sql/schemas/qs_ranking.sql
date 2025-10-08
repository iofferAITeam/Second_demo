
-- This create the QS ranking dataset 

CREATE TABLE qs_rankings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject VARCHAR(100) NOT NULL, -- 'Accounting', 'Education', etc.
    institution VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    -- The 2025 rank, split into three parts
    rank_2025_display VARCHAR(20),  -- Stores the raw text like '=12' or '101-150'
    rank_2025_start INT,            -- The numeric start of the rank
    rank_2025_end INT,              -- The numeric end of the rank
    -- The 2024 rank, split into three parts
    rank_2024_display VARCHAR(20),  -- Stores the raw text like '=12' or '101-150'
    rank_2024_start INT,            -- The numeric start of the rank
    rank_2024_end INT,              -- The numeric end of the rank
    -- Include other relevant metric columns
    score DECIMAL(4, 1),             -- Use DECIMAL for scores; allow NULL
    academic_score DECIMAL(4, 1),
    employer_score DECIMAL(4, 1),
    -- You can add all other columns from your CSV here
    ar_rank VARCHAR(20),
    er_rank VARCHAR(20),
    citations DECIMAL(4, 1),
    cpp_rank VARCHAR(20),
    h DECIMAL(4, 1),
    h_rank VARCHAR(20),
    irn DECIMAL(4, 1),
    irn_rank VARCHAR(20)
    
);

-- An index makes querying by rank and subject much faster
CREATE INDEX idx_subject_rank ON qs_rankings (subject, rank_2025_start, rank_2025_end);
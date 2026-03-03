import math
import re
from collections import Counter

def extract_number_features(phone_number: str) -> dict:
    # Strip non-digits
    cleaned = re.sub(r'\D', '', phone_number)
    
    # Fallback for empty strings
    if not cleaned:
        return {
            "repetition_ratio": 0.0,
            "unique_digit_ratio": 0.0,
            "seq_pattern_score": 0.0,
            "alt_pattern_score": 0.0,
            "palindrome_score": 0.0,
            "same_prefix_score": 0.0,
            "short_number_penalty": 1.0,
            "all_same_digit_flag": 0.0,
            "country_code_risk": 1.0,
            "entropy_score": 0.0
        }

    total_length = len(cleaned)
    counts = Counter(cleaned)
    
    # 1. Repetition Ratio (max occurrences of same digit / total length)
    max_digit_count = max(counts.values())
    repetition_ratio = max_digit_count / total_length
    
    # 2. Unique Digit Ratio
    unique_digits = len(counts)
    unique_digit_ratio = unique_digits / total_length
    
    # 3. Sequential Pattern Score (longest increasing/decreasing sequence)
    max_seq = 1
    current_seq_up = 1
    current_seq_down = 1
    for i in range(1, total_length):
        diff = int(cleaned[i]) - int(cleaned[i-1])
        if diff == 1:
            current_seq_up += 1
            max_seq = max(max_seq, current_seq_up)
        else:
            current_seq_up = 1
            
        if diff == -1:
            current_seq_down += 1
            max_seq = max(max_seq, current_seq_down)
        else:
            current_seq_down = 1
    seq_pattern_score = max_seq / total_length

    # 4. Alternating Pattern Detection (e.g., 121212)
    alt_len = 2
    max_alt = 2 if total_length >= 2 else 0
    for i in range(2, total_length):
        if cleaned[i] == cleaned[i-2]:
            alt_len += 1
            max_alt = max(max_alt, alt_len)
        else:
            alt_len = 2
    alt_pattern_score = max_alt / total_length if total_length > 0 else 0
    
    # 5. Mirror / Palindrome Pattern (e.g., 123321)
    palindrome_score = 1.0 if cleaned == cleaned[::-1] and total_length >= 4 else 0.0
    
    # 6. Same Prefix Suspicion (first 4 digits identical)
    same_prefix_score = 1.0 if total_length >= 4 and len(set(cleaned[:4])) == 1 else 0.0
    
    # 7. Very Short Number Penalty
    short_number_penalty = 1.0 if total_length < 8 else 0.0
    
    # 8. All-Zero or All-Same Digit Flag
    all_same_digit_flag = 1.0 if repetition_ratio >= 0.8 else 0.0
    
    # 9. Country Code Risk Weight
    country_code_risk = 0.0
    if not phone_number.startswith('+') and not phone_number.startswith('0'):
        country_code_risk = 0.2  # missing standard prefix formats
    elif phone_number.startswith('+'):
        # Usually valid ones are 1-3 digits. Mark unknown long prefixes as risk
        if not any(phone_number.startswith(cc) for cc in ['+1', '+44', '+91']):
            # Basic dummy risk for unknown + codes
            country_code_risk = 0.4 
        else:
            country_code_risk = 0.1
    else:
        country_code_risk = 0.2
        
    # 10. Entropy Score (Digit randomness, very low entropy -> suspicious)
    entropy_score = 0.0
    for count in counts.values():
        p = count / total_length
        entropy_score -= p * math.log2(p)
        
    return {
        "repetition_ratio": float(repetition_ratio),
        "unique_digit_ratio": float(unique_digit_ratio),
        "seq_pattern_score": float(seq_pattern_score),
        "alt_pattern_score": float(alt_pattern_score),
        "palindrome_score": float(palindrome_score),
        "same_prefix_score": float(same_prefix_score),
        "short_number_penalty": float(short_number_penalty),
        "all_same_digit_flag": float(all_same_digit_flag),
        "country_code_risk": float(country_code_risk),
        "entropy_score": float(entropy_score)
    }

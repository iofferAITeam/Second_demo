def merge_json(original, update):
    """
    Recursively merges `update` into `original`.
    Existing non-null values in `original` are preserved unless `update` provides new ones.
    """
    if isinstance(original, dict) and isinstance(update, dict):
        for key, value in update.items():
            if key in original:
                if isinstance(value, dict):
                    merge_json(original[key], value)
                elif value not in (None, "", [], {}):
                    original[key] = value
            else:
                original[key] = value
    return original

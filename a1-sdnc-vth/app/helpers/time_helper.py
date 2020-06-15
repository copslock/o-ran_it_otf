"""
    Module Info:
"""
import datetime

def unix_time_millis(d_time):
    """
    Args:
    Returns:
    Examples:
    """
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (d_time - epoch).total_seconds() * 1000.0

def timed_function(func):
    """
    Args:
    Returns:
    Examples:
    """
    start_time = unix_time_millis(datetime.datetime.now())
    func()
    end_time = unix_time_millis(datetime.datetime.now())
    return end_time - start_time

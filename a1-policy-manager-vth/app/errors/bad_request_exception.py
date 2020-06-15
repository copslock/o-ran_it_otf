"""
Args:
Returns:
Examples:
"""
class BadRequestException(Exception):
    """
    Args:
    Returns:
    Examples:
    """
    def __init__(self, status_code=406, message="Not Acceptable Response"):
        cases = {
            401:"Unauthorized",
            403:"Forbidden",
            404:"Not Found",
            423:"Not Operational"
            }
        super().__init__(cases.get(status_code, message))
        self.status_code = status_code
        self.message = message

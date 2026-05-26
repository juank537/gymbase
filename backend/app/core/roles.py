from enum import StrEnum

class UserRole(StrEnum):
    ADMIN = "admin"
    TRAINER = "trainer"
    MEMBER = "member"
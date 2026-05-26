from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from ..models.member import Member, MemberStatus

async def list_members(db: AsyncSession, page: int = 1, limit: int = 20, status: MemberStatus | None = None):
    query = select(Member).order_by(Member.joined_at.desc())
    count_query = select(func.count(Member.id))
    if status:
        query = query.where(Member.status == status)
        count_query = count_query.where(Member.status == status)

    offset = (page - 1) * limit
    total = (await db.execute(count_query)).scalar()
    result = await db.execute(query.offset(offset).limit(limit))
    return result.scalars().all(), total

async def create_member(db: AsyncSession, data: dict) -> Member:
    member = Member(**data, joined_at=datetime.now(timezone.utc))
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member

async def terminate_member(db: AsyncSession, member_id: int, end_date: datetime | None = None) -> Member:
    member = await db.get(Member, member_id)
    if not member:
        raise ValueError("Miembro no encontrado")
    
    member.status = MemberStatus.CANCELLED
    member.ended_at = end_date or datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(member)
    return member
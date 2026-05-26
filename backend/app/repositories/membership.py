from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone, timedelta
from ..models.membership import Membership, MembershipStatus
from ..models.plan import Plan


async def list_memberships(
    db: AsyncSession, page: int = 1, limit: int = 20, member_id: int | None = None
):
    query = select(Membership).order_by(Membership.start_date.desc())
    count_query = select(func.count(Membership.id))
    if member_id:
        query = query.where(Membership.member_id == member_id)
        count_query = count_query.where(Membership.member_id == member_id)
    offset = (page - 1) * limit
    total = (await db.execute(count_query)).scalar()
    result = await db.execute(query.offset(offset).limit(limit))
    return result.scalars().all(), total


async def create_membership(db: AsyncSession, data: dict) -> Membership:
    plan = await db.get(Plan, data["plan_id"])
    start = data.get("start_date") or datetime.now(timezone.utc)
    end = data.get("end_date") or (start + timedelta(days=plan.duration_days))
    membership = Membership(
        member_id=data["member_id"],
        plan_id=data["plan_id"],
        start_date=start,
        end_date=end,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)
    return membership


async def cancel_membership(db: AsyncSession, membership_id: int) -> Membership | None:
    membership = await db.get(Membership, membership_id)
    if not membership:
        return None
    membership.status = MembershipStatus.CANCELLED
    await db.commit()
    await db.refresh(membership)
    return membership
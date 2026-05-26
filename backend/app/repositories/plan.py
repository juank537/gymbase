from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.plan import Plan, PlanStatus


async def list_plans(db: AsyncSession, page: int = 1, limit: int = 20, active_only: bool = True):
    query = select(Plan).order_by(Plan.name)
    count_query = select(func.count(Plan.id))
    if active_only:
        query = query.where(Plan.status == PlanStatus.ACTIVE)
        count_query = count_query.where(Plan.status == PlanStatus.ACTIVE)
    offset = (page - 1) * limit
    total = (await db.execute(count_query)).scalar()
    result = await db.execute(query.offset(offset).limit(limit))
    return result.scalars().all(), total


async def get_plan(db: AsyncSession, plan_id: int) -> Plan | None:
    return await db.get(Plan, plan_id)


async def create_plan(db: AsyncSession, data: dict) -> Plan:
    plan = Plan(**data)
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


async def update_plan(db: AsyncSession, plan_id: int, data: dict) -> Plan | None:
    plan = await db.get(Plan, plan_id)
    if not plan:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(plan, key, value)
    await db.commit()
    await db.refresh(plan)
    return plan
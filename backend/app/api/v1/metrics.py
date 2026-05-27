from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, and_
from datetime import datetime, timedelta, timezone
from ...core.dependencies import get_db, require_role, limiter
from ...core.roles import UserRole
from ...models.user import User
from ...models.member import Member
from ...models.membership import Membership, MembershipStatus
from ...models.plan import Plan

router = APIRouter(prefix="/metrics", tags=["Métricas"])


@router.get("/dashboard")
@limiter.limit("30/minute")
async def get_dashboard_metrics(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN))
):
    """Get comprehensive dashboard metrics"""
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # Total users
    total_users_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_result.scalar()
    
    # Active users
    active_users_result = await db.execute(
        select(func.count()).select_from(User).where(User.is_active == True)
    )
    active_users = active_users_result.scalar()
    
    # Total members
    total_members_result = await db.execute(select(func.count()).select_from(Member))
    total_members = total_members_result.scalar()
    
    # Active members (with active membership)
    active_members_result = await db.execute(
        select(func.count()).select_from(Member).join(
            Membership, Member.id == Membership.member_id
        ).where(
            and_(
                Membership.status == MembershipStatus.ACTIVE,
                Membership.end_date >= now
            )
        )
    )
    active_members = active_members_result.scalar()
    
    # New members this month
    first_day_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_members_result = await db.execute(
        select(func.count()).select_from(Member).where(Member.joined_at >= first_day_month)
    )
    new_members_month = new_members_result.scalar()
    
    # New members last 30 days
    new_members_30d_result = await db.execute(
        select(func.count()).select_from(Member).where(Member.joined_at >= thirty_days_ago)
    )
    new_members_30d = new_members_30d_result.scalar()
    
    # Total memberships
    total_memberships_result = await db.execute(select(func.count()).select_from(Membership))
    total_memberships = total_memberships_result.scalar()
    
    # Active memberships
    active_memberships_result = await db.execute(
        select(func.count()).select_from(Membership).where(
            and_(
                Membership.status == MembershipStatus.ACTIVE,
                Membership.end_date >= now
            )
        )
    )
    active_memberships = active_memberships_result.scalar()
    
    # Expired memberships
    expired_memberships_result = await db.execute(
        select(func.count()).select_from(Membership).where(
            Membership.end_date < now
        )
    )
    expired_memberships = expired_memberships_result.scalar()
    
    # Revenue calculation (sum of plan prices for active memberships)
    revenue_result = await db.execute(
        select(func.sum(Plan.price)).select_from(Membership).join(
            Plan, Membership.plan_id == Plan.id
        ).where(
            and_(
                Membership.status == MembershipStatus.ACTIVE,
                Membership.end_date >= now
            )
        )
    )
    monthly_revenue = revenue_result.scalar() or 0
    
    # Revenue this month
    revenue_month_result = await db.execute(
        select(func.sum(Plan.price)).select_from(Membership).join(
            Plan, Membership.plan_id == Plan.id
        ).where(
            and_(
                Membership.status == MembershipStatus.ACTIVE,
                Membership.start_date >= first_day_month
            )
        )
    )
    revenue_month = revenue_month_result.scalar() or 0
    
    # Members by status
    members_by_status = {}
    for status in ["trial", "active", "cancelled"]:
        count_result = await db.execute(
            select(func.count()).select_from(Member).where(Member.status == status)
        )
        members_by_status[status] = count_result.scalar()
    
    # Memberships by plan
    memberships_by_plan = []
    plan_results = await db.execute(
        select(Plan.name, func.count(Membership.id), func.sum(Plan.price))
        .join(Membership, Plan.id == Membership.plan_id)
        .where(Membership.status == MembershipStatus.ACTIVE)
        .group_by(Plan.name)
    )
    for row in plan_results.scalars().all():
        memberships_by_plan.append({
            "plan_name": row[0],
            "count": row[1],
            "revenue": row[2] or 0
        })
    
    # Recent activity (last 10 members)
    recent_members = []
    recent_results = await db.execute(
        select(Member).order_by(Member.joined_at.desc()).limit(10)
    )
    for member in recent_results.scalars().all():
        recent_members.append({
            "id": member.id,
            "full_name": member.full_name,
            "email": member.user.email if member.user else None,
            "status": member.status,
            "created_at": member.joined_at.isoformat()
        })
    
    return {
        "overview": {
            "total_users": total_users,
            "active_users": active_users,
            "total_members": total_members,
            "active_members": active_members,
            "monthly_revenue": round(monthly_revenue, 2),
            "revenue_this_month": round(revenue_month, 2)
        },
        "members": {
            "new_this_month": new_members_month,
            "new_last_30_days": new_members_30d,
            "by_status": members_by_status
        },
        "memberships": {
            "total": total_memberships,
            "active": active_memberships,
            "expired": expired_memberships,
            "by_plan": memberships_by_plan
        },
        "recent_activity": recent_members,
        "generated_at": now.isoformat()
    }


@router.get("/members/trend")
@limiter.limit("30/minute")
async def get_members_trend(
    request: Request,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN))
):
    """Get member growth trend over time"""
    start_date = now - timedelta(days=days)
    
    trend_data = []
    for i in range(days):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        count_result = await db.execute(
            select(func.count()).select_from(Member).where(
                and_(
                    Member.joined_at >= day_start,
                    Member.joined_at < day_end
                )
            )
        )
        count = count_result.scalar()
        
        trend_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "new_members": count
        })
    
    return {"period_days": days, "trend": trend_data}


@router.get("/revenue/trend")
@limiter.limit("30/minute")
async def get_revenue_trend(
    request: Request,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_role(UserRole.ADMIN))
):
    """Get revenue trend over time"""
    start_date = now - timedelta(days=days)
    
    trend_data = []
    for i in range(days):
        day_start = start_date + timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        revenue_result = await db.execute(
            select(func.sum(Plan.price)).select_from(Membership).join(
                Plan, Membership.plan_id == Plan.id
            ).where(
                and_(
                    Membership.status == MembershipStatus.ACTIVE,
                    Membership.start_date >= day_start,
                    Membership.start_date < day_end
                )
            )
        )
        revenue = revenue_result.scalar() or 0
        
        trend_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "revenue": round(revenue, 2)
        })
    
    return {"period_days": days, "trend": trend_data}
import { INVITATION_STATUS } from "../constants/invitationStatus.js";
import WorkspaceInvitation from "../models/invitation.model.js"
import { sendEmail } from "../services/email.service.js";

export const createInvitation = (data) => {
    return WorkspaceInvitation.create(data);
}

export const findPendingInvitation = (workspaceId, email) => {
    return WorkspaceInvitation.findOne({
        workspace: workspaceId,
        email,
        status: INVITATION_STATUS.PENDING
    });
}

export const sendWorkspaceInvitationEmail = async ({
    to,
    workspaceName,
    inviterName,
    invitationToken,
}) => {
    const invitationLink =
        `${process.env.CLIENT_URL}/invitations/${invitationToken}`;

    return sendEmail({
        to,

        subject: `You're invited to join ${workspaceName} on ProjectFlow`,

        html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="x-apple-disable-message-reformatting" />
                    <title>You're invited to ProjectFlow</title>
                </head>

                <body
                    style="
                        margin: 0;
                        padding: 0;
                        background-color: #f4f6fb;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif;
                        color: #111827;
                    "
                >
                    <!-- Background -->
                    <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            width: 100%;
                            background-color: #f4f6fb;
                            padding: 48px 16px;
                        "
                    >
                        <tr>
                            <td align="center">

                                <!-- Main Container -->
                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        width: 100%;
                                        max-width: 580px;
                                        background-color: #ffffff;
                                        border-radius: 20px;
                                        overflow: hidden;
                                        border: 1px solid #e8eaf0;
                                        box-shadow: 0 8px 30px rgba(17, 24, 39, 0.06);
                                    "
                                >

                                    <!-- ================================= -->
                                    <!-- Header -->
                                    <!-- ================================= -->
                                    <tr>
                                        <td
                                            style="
                                                padding: 24px 32px;
                                                background-color: #ffffff;
                                            "
                                        >
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                <tr>
                                                    <td align="left">

                                                        <!-- Logo -->
                                                        <table
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            border="0"
                                                        >
                                                            <tr>
                                                                <td
                                                                    valign="middle"
                                                                    style="
                                                                        width: 34px;
                                                                        height: 34px;
                                                                        background-color: #6c63ff;
                                                                        border-radius: 9px;
                                                                        text-align: center;
                                                                        font-size: 17px;
                                                                        color: #ffffff;
                                                                        font-weight: 700;
                                                                    "
                                                                >
                                                                    P
                                                                </td>

                                                                <td
                                                                    valign="middle"
                                                                    style="
                                                                        padding-left: 10px;
                                                                        font-size: 20px;
                                                                        line-height: 24px;
                                                                        font-weight: 700;
                                                                        color: #18181b;
                                                                        letter-spacing: -0.4px;
                                                                    "
                                                                >
                                                                    ProjectFlow
                                                                </td>
                                                            </tr>
                                                        </table>

                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>


                                    <!-- ================================= -->
                                    <!-- Hero -->
                                    <!-- ================================= -->
                                    <tr>
                                        <td
                                            align="center"
                                            style="
                                                padding: 42px 32px 38px;
                                                background-color: #f8f7ff;
                                                border-top: 1px solid #f0eff8;
                                                border-bottom: 1px solid #eeeef5;
                                            "
                                        >

                                            <!-- Invitation Icon -->
                                            <table
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="margin-bottom: 22px;"
                                            >
                                                <tr>
                                                    <td
                                                        align="center"
                                                        valign="middle"
                                                        style="
                                                            width: 68px;
                                                            height: 68px;
                                                            background-color: #e9e7ff;
                                                            border-radius: 20px;
                                                            font-size: 30px;
                                                            line-height: 68px;
                                                        "
                                                    >
                                                        👋
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Small Label -->
                                            <div
                                                style="
                                                    margin-bottom: 10px;
                                                    font-size: 12px;
                                                    line-height: 18px;
                                                    font-weight: 700;
                                                    color: #6c63ff;
                                                    letter-spacing: 1.2px;
                                                    text-transform: uppercase;
                                                "
                                            >
                                                You're invited
                                            </div>

                                            <!-- Heading -->
                                            <h1
                                                style="
                                                    margin: 0;
                                                    font-size: 30px;
                                                    line-height: 38px;
                                                    font-weight: 700;
                                                    letter-spacing: -0.8px;
                                                    color: #111827;
                                                "
                                            >
                                                Join our team on<br />
                                                ProjectFlow
                                            </h1>

                                            <p
                                                style="
                                                    margin: 14px 0 0;
                                                    font-size: 15px;
                                                    line-height: 24px;
                                                    color: #6b7280;
                                                "
                                            >
                                                Collaborate, manage projects, and get things
                                                done together.
                                            </p>

                                        </td>
                                    </tr>


                                    <!-- ================================= -->
                                    <!-- Content -->
                                    <!-- ================================= -->
                                    <tr>
                                        <td style="padding: 34px 32px 36px;">

                                            <!-- Inviter -->
                                            <p
                                                style="
                                                    margin: 0 0 24px;
                                                    font-size: 15px;
                                                    line-height: 24px;
                                                    color: #4b5563;
                                                    text-align: center;
                                                "
                                            >
                                                <strong style="color: #111827;">
                                                    ${inviterName}
                                                </strong>
                                                has invited you to join their workspace.
                                            </p>


                                            <!-- Workspace Card -->
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="
                                                    width: 100%;
                                                    background-color: #fafaff;
                                                    border: 1px solid #e7e5ff;
                                                    border-radius: 14px;
                                                "
                                            >
                                                <tr>
                                                    <td style="padding: 20px;">

                                                        <table
                                                            width="100%"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            border="0"
                                                        >
                                                            <tr>

                                                                <!-- Workspace Avatar -->
                                                                <td
                                                                    valign="middle"
                                                                    style="width: 48px;"
                                                                >
                                                                    <div
                                                                        style="
                                                                            width: 44px;
                                                                            height: 44px;
                                                                            line-height: 44px;
                                                                            text-align: center;
                                                                            background-color: #6c63ff;
                                                                            border-radius: 12px;
                                                                            color: #ffffff;
                                                                            font-size: 18px;
                                                                            font-weight: 700;
                                                                        "
                                                                    >
                                                                        P
                                                                    </div>
                                                                </td>

                                                                <!-- Workspace Info -->
                                                                <td
                                                                    valign="middle"
                                                                    style="padding-left: 14px;"
                                                                >
                                                                    <div
                                                                        style="
                                                                            font-size: 11px;
                                                                            line-height: 16px;
                                                                            font-weight: 700;
                                                                            color: #8b8fa3;
                                                                            text-transform: uppercase;
                                                                            letter-spacing: 0.8px;
                                                                        "
                                                                    >
                                                                        Workspace
                                                                    </div>

                                                                    <div
                                                                        style="
                                                                            margin-top: 3px;
                                                                            font-size: 17px;
                                                                            line-height: 24px;
                                                                            font-weight: 650;
                                                                            color: #25263a;
                                                                        "
                                                                    >
                                                                        ${workspaceName}
                                                                    </div>
                                                                </td>

                                                            </tr>
                                                        </table>

                                                    </td>
                                                </tr>
                                            </table>


                                            <!-- CTA Description -->
                                            <p
                                                style="
                                                    margin: 26px 0 20px;
                                                    font-size: 14px;
                                                    line-height: 22px;
                                                    color: #6b7280;
                                                    text-align: center;
                                                "
                                            >
                                                Accept your invitation to access the workspace
                                                and start collaborating with our team.
                                            </p>


                                            <!-- ================================= -->
                                            <!-- CTA Button -->
                                            <!-- ================================= -->
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                            >
                                                <tr>
                                                    <td align="center">

                                                        <table
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            border="0"
                                                        >
                                                            <tr>
                                                                <td
                                                                    align="center"
                                                                    style="
                                                                        background-color: #6c63ff;
                                                                        border-radius: 10px;
                                                                        box-shadow: 0 6px 16px rgba(108, 99, 255, 0.25);
                                                                    "
                                                                >
                                                                    <a
                                                                        href="${invitationLink}"
                                                                        target="_blank"
                                                                        style="
                                                                            display: inline-block;
                                                                            padding: 14px 30px;
                                                                            font-size: 14px;
                                                                            line-height: 20px;
                                                                            font-weight: 700;
                                                                            color: #ffffff;
                                                                            text-decoration: none;
                                                                            border-radius: 10px;
                                                                        "
                                                                    >
                                                                        Accept Invitation
                                                                        &nbsp; →
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </table>

                                                    </td>
                                                </tr>
                                            </table>


                                            <!-- Security / Expiry -->
                                            <table
                                                width="100%"
                                                cellpadding="0"
                                                cellspacing="0"
                                                border="0"
                                                style="
                                                    margin-top: 30px;
                                                    border-top: 1px solid #eef0f4;
                                                "
                                            >
                                                <tr>
                                                    <td
                                                        style="
                                                            padding-top: 18px;
                                                            text-align: center;
                                                        "
                                                    >
                                                        <p
                                                            style="
                                                                margin: 0;
                                                                font-size: 12px;
                                                                line-height: 19px;
                                                                color: #ff5353;
                                                            "
                                                        >
                                                            This invitation expires in
                                                            <strong style="color: #ff3d3d;">
                                                                7 days
                                                            </strong>.
                                                        </p>

                                                        <p
                                                            style="
                                                                margin: 5px 0 0;
                                                                font-size: 12px;
                                                                line-height: 19px;
                                                                color: #b0b4bd;
                                                            "
                                                        >
                                                            If you weren't expecting this
                                                            invitation, you can safely ignore
                                                            this email.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>

                                        </td>
                                    </tr>


                                    <!-- ================================= -->
                                    <!-- Footer -->
                                    <!-- ================================= -->
                                    <tr>
                                        <td
                                            align="center"
                                            style="
                                                padding: 22px 32px;
                                                background-color: #fafafa;
                                                border-top: 1px solid #eef0f4;
                                            "
                                        >

                                            <p
                                                style="
                                                    margin: 0;
                                                    font-size: 12px;
                                                    line-height: 18px;
                                                    color: #9ca3af;
                                                "
                                            >
                                                This invitation was sent via
                                                <strong style="color: #7c7f88;">
                                                    ProjectFlow
                                                </strong>
                                            </p>

                                            <p
                                                style="
                                                    margin: 6px 0 0;
                                                    font-size: 11px;
                                                    line-height: 17px;
                                                    color: #b8bbc3;
                                                "
                                            >
                                                © ProjectFlow. All rights reserved.
                                            </p>

                                        </td>
                                    </tr>

                                </table>


                                <!-- Bottom Text -->
                                <p
                                    style="
                                        margin: 18px 0 0;
                                        font-size: 11px;
                                        line-height: 17px;
                                        color: #aeb2bc;
                                        text-align: center;
                                    "
                                >
                                    You're receiving this email because someone invited you
                                    to a ProjectFlow workspace.
                                </p>

                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
    });
};

export const findInvitationByToken = async (token, workspace) => {
    return WorkspaceInvitation.findOne({ token, workspace })
        .populate("workspace", "name")
        .populate("invitedBy", "name email")
        .select("-token")
        .lean();
};

export const findWorkspaceAllInvitations = async (workspaceId) => {

    return WorkspaceInvitation.find({
        workspace: workspaceId
    })
        .populate("workspace", "name")
        .populate("invitedBy", "name email")
        .select("-token")
        .lean();

};

export const findPendingInvitationsByEmail = async (email) => {

    return WorkspaceInvitation.find({
        email,
        status: INVITATION_STATUS.PENDING,
        expiresAt: {
            $gt: new Date()
        }
    })
        .populate("workspace", "name")
        .populate("invitedBy", "name email")
        .select("-token")
        .lean();

};


export const findInvitationForAcceptance = async (token, workspaceId) => {
    return WorkspaceInvitation.findOne({
        token,
        workspace: workspaceId
    });
};

export const markInvitationAsAccepted = async (invitationId) => {
    return WorkspaceInvitation.findByIdAndUpdate(
        invitationId,
        {
            status: INVITATION_STATUS.ACCEPTED
        },
        {
            new: true
        }
    );
};